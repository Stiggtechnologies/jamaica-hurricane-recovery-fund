import { useState } from 'react';
import { Heart, DollarSign, Calendar, Shield, CreditCard, AlertCircle } from 'lucide-react';
import StripeCheckout from '../components/StripeCheckout';

export default function Donate() {
  const [donationType, setDonationType] = useState<'one-time' | 'recurring'>('one-time');
  const [amount, setAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const presetAmounts = [25, 50, 100, 250, 500, 1000];

  const handleAmountSelect = (value: number) => {
    setAmount(value);
    setCustomAmount('');
  };

  const handleCustomAmount = (value: string) => {
    setCustomAmount(value);
    setAmount(null);
    setError(null);
  };

  const getFinalAmount = (): number => {
    if (customAmount) {
      return parseFloat(customAmount);
    }
    return amount || 0;
  };

  const handlePaymentSuccess = () => {
    setSuccess(true);
    setError(null);
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
    setSuccess(false);
  };

  return (
    <div className="bg-white">
      <section
        className="relative h-[400px] bg-cover bg-center flex items-center"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(https://images.pexels.com/photos/6646917/pexels-photo-6646917.jpeg?auto=compress&cs=tinysrgb&w=1920)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-heading font-bold text-white mb-4">
            Make a Donation
          </h1>
          <p className="text-xl text-white max-w-2xl mx-auto">
            Your generosity directly supports families and communities rebuilding their lives
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="mb-8">
                  <h2 className="text-3xl font-heading font-bold text-gray-900 mb-2">
                    Support Our Mission
                  </h2>
                  <p className="text-gray-600">
                    Every contribution brings hope and rebuilds lives
                  </p>
                </div>

                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-4">
                    Donation Type
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setDonationType('one-time')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        donationType === 'one-time'
                          ? 'border-jamaican-green bg-primary-50 text-jamaican-green'
                          : 'border-gray-300 hover:border-jamaican-green'
                      }`}
                    >
                      <DollarSign className="mx-auto mb-2" size={24} />
                      <div className="font-semibold">One-Time</div>
                    </button>
                    <button
                      onClick={() => setDonationType('recurring')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        donationType === 'recurring'
                          ? 'border-jamaican-green bg-primary-50 text-jamaican-green'
                          : 'border-gray-300 hover:border-jamaican-green'
                      }`}
                    >
                      <Calendar className="mx-auto mb-2" size={24} />
                      <div className="font-semibold">Monthly</div>
                    </button>
                  </div>
                </div>

                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-4">
                    Currency
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {['USD', 'CAD', 'GBP'].map((curr) => (
                      <button
                        key={curr}
                        onClick={() => setCurrency(curr)}
                        className={`p-3 rounded-lg border-2 font-semibold transition-all ${
                          currency === curr
                            ? 'border-jamaican-green bg-primary-50 text-jamaican-green'
                            : 'border-gray-300 hover:border-jamaican-green'
                        }`}
                      >
                        {curr}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-4">
                    Select Amount ({currency})
                  </label>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    {presetAmounts.map((preset) => (
                      <button
                        key={preset}
                        onClick={() => handleAmountSelect(preset)}
                        className={`p-4 rounded-lg border-2 font-semibold text-lg transition-all ${
                          amount === preset
                            ? 'border-jamaican-green bg-primary-50 text-jamaican-green'
                            : 'border-gray-300 hover:border-jamaican-green'
                        }`}
                      >
                        {currency === 'USD' && '$'}
                        {currency === 'CAD' && 'CA$'}
                        {currency === 'GBP' && '£'}
                        {preset}
                      </button>
                    ))}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Or enter custom amount
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="Enter amount"
                      value={customAmount}
                      onChange={(e) => handleCustomAmount(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-jamaican-green focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="border-t pt-8">
                  <h3 className="text-xl font-heading font-bold mb-4">
                    Complete Your Donation
                  </h3>

                  {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                      <AlertCircle className="text-red-600 mr-3 flex-shrink-0 mt-0.5" size={20} />
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  )}

                  {success && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800 font-semibold">
                        Thank you for your donation! You will receive a confirmation email shortly.
                      </p>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-6 border-2 border-jamaican-green">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <CreditCard className="text-jamaican-green mr-3" size={32} />
                          <div>
                            <div className="font-semibold text-lg">Credit/Debit Card</div>
                            <div className="text-sm text-gray-600">Secure payment via Stripe</div>
                          </div>
                        </div>
                        <Shield className="text-jamaican-green" size={24} />
                      </div>

                      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-600">Donation Type:</span>
                          <span className="font-semibold capitalize">{donationType}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-600">Amount:</span>
                          <span className="font-semibold text-lg">
                            {currency === 'USD' && '$'}
                            {currency === 'CAD' && 'CA$'}
                            {currency === 'GBP' && '£'}
                            {getFinalAmount() || '0'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Currency:</span>
                          <span className="font-semibold">{currency}</span>
                        </div>
                      </div>

                      <StripeCheckout
                        amount={getFinalAmount()}
                        currency={currency}
                        donationType={donationType}
                        onSuccess={handlePaymentSuccess}
                        onError={handlePaymentError}
                      />
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-300">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <Heart className="text-jamaican-green mr-3" size={32} />
                          <div>
                            <div className="font-semibold text-lg">Donorbox</div>
                            <div className="text-sm text-gray-600">Alternative donation platform</div>
                          </div>
                        </div>
                        <Shield className="text-gray-400" size={24} />
                      </div>
                      <div className="bg-white rounded p-4 text-center border border-gray-200">
                        <p className="text-gray-600 text-sm mb-2">
                          Donate through Donorbox
                        </p>
                        <p className="text-xs text-gray-500">
                          Integration ready - Donorbox widget will appear here
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-900">
                      <strong>Secure Payment:</strong> All transactions are encrypted and secure. Your financial information is protected by industry-leading security standards.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-jamaican-green to-primary-600 rounded-2xl p-8 text-white sticky top-24">
                <h3 className="text-2xl font-heading font-bold mb-6">
                  Your Impact
                </h3>

                <div className="space-y-6 mb-8">
                  <div className="flex items-start">
                    <div className="bg-white bg-opacity-20 rounded-full p-2 mr-3 flex-shrink-0">
                      <Heart size={20} />
                    </div>
                    <div>
                      <div className="font-semibold mb-1">$25</div>
                      <div className="text-sm opacity-90">Provides emergency supplies for one family</div>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-white bg-opacity-20 rounded-full p-2 mr-3 flex-shrink-0">
                      <Heart size={20} />
                    </div>
                    <div>
                      <div className="font-semibold mb-1">$100</div>
                      <div className="text-sm opacity-90">Rebuilds a classroom for 30 students</div>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-white bg-opacity-20 rounded-full p-2 mr-3 flex-shrink-0">
                      <Heart size={20} />
                    </div>
                    <div>
                      <div className="font-semibold mb-1">$500</div>
                      <div className="text-sm opacity-90">Repairs a damaged home's roof</div>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-white bg-opacity-20 rounded-full p-2 mr-3 flex-shrink-0">
                      <Heart size={20} />
                    </div>
                    <div>
                      <div className="font-semibold mb-1">$1,000</div>
                      <div className="text-sm opacity-90">Constructs a community shelter</div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white border-opacity-30 pt-6">
                  <h4 className="font-semibold mb-3">Why Donate?</h4>
                  <ul className="space-y-2 text-sm opacity-90">
                    <li className="flex items-start">
                      <span className="mr-2">✓</span>
                      <span>100% transparent fund allocation</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">✓</span>
                      <span>Direct impact on communities</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">✓</span>
                      <span>Regular progress updates</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">✓</span>
                      <span>Tax-deductible receipts</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold text-gray-900 mb-4">
              Other Ways to Give
            </h2>
            <p className="text-xl text-gray-600">
              Choose the method that works best for you
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="text-jamaican-green" size={32} />
              </div>
              <h3 className="text-xl font-heading font-bold mb-3">Bank Transfer</h3>
              <p className="text-gray-600 text-sm mb-4">
                Make a direct wire transfer to our account
              </p>
              <button className="text-jamaican-green font-semibold hover:underline">
                Get Bank Details
              </button>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="text-jamaican-green" size={32} />
              </div>
              <h3 className="text-xl font-heading font-bold mb-3">Check/Cheque</h3>
              <p className="text-gray-600 text-sm mb-4">
                Mail a check to our office address
              </p>
              <button className="text-jamaican-green font-semibold hover:underline">
                Mailing Address
              </button>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="text-jamaican-green" size={32} />
              </div>
              <h3 className="text-xl font-heading font-bold mb-3">Corporate Matching</h3>
              <p className="text-gray-600 text-sm mb-4">
                Double your impact with employer matching
              </p>
              <button className="text-jamaican-green font-semibold hover:underline">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-primary-600 to-jamaican-green rounded-2xl p-12 text-white text-center">
            <Shield className="mx-auto mb-6" size={64} />
            <h2 className="text-3xl font-heading font-bold mb-4">
              Your Donation is Secure
            </h2>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              All transactions are encrypted and secure. We use industry-leading payment processors
              to ensure your financial information is protected. Your generosity is tax-deductible,
              and you'll receive a receipt for your records.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
