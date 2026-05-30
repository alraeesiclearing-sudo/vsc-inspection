import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const errorMessages: Record<string, string> = {
  'card_declined': 'تم رفض البطاقة من قبل البنك',
  'insufficient_funds': 'الرصيد غير كافٍ في البطاقة',
  'expired_card': 'البطاقة منتهية الصلاحية',
  'incorrect_cvc': 'رمز CVV غير صحيح',
  'incorrect_number': 'رقم البطاقة غير صحيح',
  'invalid_expiry_month': 'شهر انتهاء الصلاحية غير صحيح',
  'invalid_expiry_year': 'سنة انتهاء الصلاحية غير صحيحة',
  'stolen_card': 'البطاقة مبلغ عنها كمسروقة',
  'lost_card': 'البطاقة مبلغ عنها كمفقودة',
  'do_not_honor': 'رفض البنك العملية',
  'authentication_required': 'يتطلب التحقق الثنائي من البنك',
  'generic_decline': 'تم رفض البطاقة',
  'fraudulent': 'تم رفض البطاقة لأسباب أمنية',
  'pickup_card': 'يرجى التواصل مع البنك المصدر',
  'restricted_card': 'البطاقة مقيدة من قبل البنك',
  'security_violation': 'خطأ أمني في البطاقة',
  'service_not_allowed': 'هذه الخدمة غير مسموح بها لهذه البطاقة',
  'transaction_not_allowed': 'هذه المعاملة غير مسموح بها',
  'card_velocity_exceeded': 'تجاوزت حد المعاملات المسموح به',
};

export async function POST(req: NextRequest) {
  try {
    const { cardNumber, expMonth, expYear, cvc, cardHolder, amount } = await req.json();

    if (!cardNumber || !expMonth || !expYear || !cvc) {
      return NextResponse.json({ success: false, error: 'بيانات البطاقة غير مكتملة' }, { status: 400 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      // إذا لم يكن المفتاح موجوداً، نكمل بدون تحقق
      return NextResponse.json({ success: true, message: 'skipped' });
    }

    // إنشاء PaymentMethod باستخدام Stripe API مباشرة (server-side)
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: {
        number: cardNumber,
        exp_month: expMonth,
        exp_year: expYear,
        cvc: cvc,
      },
      billing_details: {
        name: cardHolder || 'Card Holder',
      },
    });

    // إنشاء PaymentIntent بـ manual capture (Authorization فقط - لا يخصم المبلغ)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount || 100,
      currency: 'usd',
      payment_method: paymentMethod.id,
      confirm: true,
      capture_method: 'manual',
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never',
      },
    });

    if (paymentIntent.status === 'requires_capture') {
      // إلغاء الـ Authorization فوراً (لا نريد خصم المبلغ)
      await stripe.paymentIntents.cancel(paymentIntent.id);
      return NextResponse.json({
        success: true,
        message: 'البطاقة صالحة ولديها رصيد كافٍ',
        brand: paymentMethod.card?.brand || 'card',
        last4: paymentMethod.card?.last4 || '',
        bank: paymentMethod.card?.issuer || '',
      });
    }

    if (paymentIntent.status === 'succeeded') {
      return NextResponse.json({
        success: true,
        message: 'البطاقة صالحة',
        brand: paymentMethod.card?.brand || 'card',
        last4: paymentMethod.card?.last4 || '',
      });
    }

    return NextResponse.json({
      success: false,
      error: 'تم رفض البطاقة من قبل البنك',
      code: paymentIntent.status,
    });

  } catch (error: any) {
    console.error('Stripe error:', error);

    const code = error.code || error.decline_code || 'unknown';
    const message = errorMessages[code] || error.message || 'حدث خطأ في التحقق من البطاقة';

    return NextResponse.json({
      success: false,
      error: message,
      code: code,
    }, { status: 400 });
  }
}
