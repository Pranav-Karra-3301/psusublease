'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useAuthContext } from '@/components/auth/AuthProvider';

const AIAutofillPromo = () => {
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();
  const { user } = useAuthContext();

  const handleAutofillClick = () => {
    if (user) {
      router.push('/create?autofill=true');
    } else {
      router.push('/auth/signin?redirect=/create?autofill=true');
    }
  };

  return (
    <Card
      className={`bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-accent/30 shadow-lg p-8 transition-all duration-300 ${
        isHovered ? 'transform -translate-y-1 shadow-xl border-accent/50' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="w-full md:w-3/4 mx-auto flex flex-col items-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-3 text-text-primary text-center md:text-left w-full">
          Post Your Sublease Instantly
        </h2>
        <ul className="space-y-3 mb-6 w-full">
          <li className="flex items-center gap-3 bg-accent/10 rounded-lg px-3 py-2 font-medium text-text-primary border-l-4 border-accent">
            <span className="text-accent text-lg">📋</span>
            <span>
              <span className="text-accent font-semibold">Copy Paste your Message</span>
              <span className="text-text-secondary font-normal"> from group chats or anywhere</span>
            </span>
          </li>
          <li className="flex items-center gap-3 bg-accent/10 rounded-lg px-3 py-2 font-medium text-text-primary border-l-4 border-accent">
            <span className="text-accent text-lg">🖼️</span>
            <span>
              <span className="text-accent font-semibold">Upload a screenshot</span>
              <span className="text-text-secondary font-normal"> of your snap or story</span>
            </span>
          </li>
        </ul>
        {/* Autofill preview image above the button, full width */}
        <img
          src="/autofillPreview.png"
          alt="AI Autofill Preview"
          className="rounded-lg shadow-lg w-full mb-6"
          style={{ border: 'none' }}
        />
        <Button
          className="shadow-lg rounded-xl px-8 py-4 text-base font-semibold bg-accent text-white hover:bg-accent/90 transition-all duration-200"
          onClick={handleAutofillClick}
        >
          Try Instant Autofill
        </Button>
      </div>
    </Card>
  );
};

export default AIAutofillPromo;