'use client';

import CreateListingForm from '@/components/listings/CreateListingForm';
import Card from '@/components/ui/Card';

export default function CreateListingPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-text-primary mb-8">Post Your Sublease</h1>
        
        <div className="mb-8">
          <Card variant="glass" className="mb-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">How it works</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-accent/10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-accent font-semibold">1</span>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-text-primary">Create your listing</h3>
                  <p className="text-text-secondary">
                    Fill out the form below with details about your apartment, rent, and lease dates.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-accent/10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-accent font-semibold">2</span>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-text-primary">Connect with potential subletters</h3>
                  <p className="text-text-secondary">
                    Students looking for a sublease will contact you through the platform.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-accent/10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-accent font-semibold">3</span>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-text-primary">Finalize the agreement</h3>
                  <p className="text-text-secondary">
                    Once you find a match, work with your apartment management to complete the sublease.
                  </p>
                </div>
              </div>
            </div>
          </Card>
          
          <div className="bg-bg-secondary border border-border-light rounded-lg p-4 text-sm text-text-secondary">
            <p className="font-medium text-text-primary mb-2">📝 Important Note</p>
            <p>
              PSU Sublease is a listing platform only and does not handle financial transactions or legal agreements between parties. 
              Always consult with your apartment management before subleasing, and follow their official process for subleasing your unit.
            </p>
          </div>
        </div>
        
        <CreateListingForm />
      </div>
    </div>
  );
} 