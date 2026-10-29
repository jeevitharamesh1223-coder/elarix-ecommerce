import React, { useState } from 'react';

const ContactPage = () => {
  const [success, setSuccess] = useState(false);
  return (
    <div className="container my-2">
      <h1 className="text-center" style={{ marginBottom: '3rem' }}>Contact Us</h1>
      <div className="flex gap-1" style={{ flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 400px', backgroundColor: '#fff', padding: '3rem', borderRadius: '12px' }}>
          {success ? <h2 style={{ color: 'var(--primary)' }}>Thank You!</h2> : (
            <form onSubmit={(e) => { e.preventDefault(); setSuccess(true); }}>
              <div className="form-group"><input type="text" placeholder="Name" className="form-control" required /></div>
              <div className="form-group"><input type="email" placeholder="Email" className="form-control" required /></div>
              <div className="form-group"><textarea placeholder="Message" className="form-control" rows="5" required></textarea></div>
              <button type="submit" className="btn" style={{ width: '100%' }}>Send Message</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
export default ContactPage;
