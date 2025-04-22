import * as React from 'react';

interface InviteEmailTemplateProps {
  message: string;
  inviteLink?: string;
}

export const InviteEmailTemplate: React.FC<Readonly<InviteEmailTemplateProps>> = ({
  message,
  inviteLink,
}) => (
  <div style={{ 
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: '#333',
    maxWidth: '600px', 
    margin: '0 auto',
    padding: '20px',
    lineHeight: '1.6'
  }}>
    <div style={{ marginBottom: '24px' }}>
      <h1 style={{ 
        fontSize: '24px', 
        fontWeight: 'bold',
        color: '#333',
        marginBottom: '16px' 
      }}>
        PSU Leases
      </h1>
      <div style={{ 
        height: '2px', 
        backgroundColor: '#5A67D8', 
        width: '100%', 
        marginBottom: '24px' 
      }}></div>
    </div>
    
    <div style={{ fontSize: '16px', marginBottom: '24px' }}>
      {message.split('\n').map((line, i) => (
        <p key={i} style={{ marginBottom: '12px' }}>{line}</p>
      ))}
    </div>
    
    {inviteLink && (
      <div style={{ marginTop: '24px', marginBottom: '24px' }}>
        <a 
          href={inviteLink}
          style={{
            backgroundColor: '#5A67D8',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '4px',
            textDecoration: 'none',
            display: 'inline-block',
            fontWeight: 'bold'
          }}
        >
          Join PSU Leases
        </a>
      </div>
    )}
    
    <div style={{ 
      borderTop: '1px solid #eee', 
      marginTop: '32px', 
      paddingTop: '16px',
      fontSize: '14px',
      color: '#666'
    }}>
      <p>
        PSU Leases - Find or list housing at Penn State University
      </p>
    </div>
  </div>
); 