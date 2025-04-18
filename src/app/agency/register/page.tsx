import AgencyRegistrationForm from '@/components/agency/AgencyRegistrationForm';

export default function AgencyRegistrationPage() {
  return (
    <div className="container mx-auto px-4 py-16 mt-16">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Property Management Agency Registration</h1>
          <p className="text-text-secondary max-w-3xl mx-auto">
            Register your property management agency with PSU Leases to post your official listings, floor plans, and reach Penn State students looking for housing.
          </p>
        </div>
        
        <AgencyRegistrationForm />
      </div>
    </div>
  );
} 