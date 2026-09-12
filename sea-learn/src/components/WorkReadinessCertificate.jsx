// Quarter 2 certificate. Markup and styling follow the design supplied by the
// programme team; only the learner name and completion date are substituted.

export default function WorkReadinessCertificate({ name, date }) {
  const learnerName = name?.trim() || '[STUDENT FULL NAME]';
  const completionDate = date || new Date().toLocaleDateString('en-ZA', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="overflow-x-auto">
      <div
        id="work-readiness-certificate"
        style={{
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          maxWidth: 800,
          margin: '40px auto',
          padding: 40,
          border: '15px solid #2C3E50',
          borderRadius: 10,
          backgroundColor: '#F8F9F9',
          textAlign: 'center',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ border: '2px solid #E5E7E9', padding: 40, backgroundColor: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 30, marginBottom: 30, flexWrap: 'wrap' }}>
            <h3 style={{ color: '#27AE60', margin: 0 }}>Social Enterprise Academy</h3>
            <h3 style={{ color: '#2980B9', margin: 0 }}>Africa Forward</h3>
          </div>

          <h1 style={{ color: '#2C3E50', fontSize: 36, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 2 }}>
            Certificate of Completion
          </h1>
          <p style={{ color: '#7F8C8D', fontSize: 18, marginBottom: 40 }}>This acknowledges that</p>

          <h2
            style={{
              color: '#D35400',
              fontSize: 32,
              marginBottom: 40,
              borderBottom: '2px solid #D35400',
              display: 'inline-block',
              paddingBottom: 10,
              width: '80%',
            }}
          >
            {learnerName}
          </h2>

          <p style={{ color: '#34495E', fontSize: 18, marginBottom: 10 }}>has successfully completed</p>
          <h3 style={{ color: '#2C3E50', fontSize: 24, marginBottom: 40 }}>
            Quarter 2 Uplift Programme:<br />Work Readiness &amp; Professional Skills
          </h3>

          <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 60, flexWrap: 'wrap', gap: 24 }}>
            <div style={{ textAlign: 'center', width: '40%', minWidth: 200 }}>
              <div style={{ borderBottom: '1px solid #7F8C8D', paddingBottom: 10, marginBottom: 10, height: 40 }}>
                <span style={{ fontFamily: "'Brush Script MT', cursive", fontSize: 24, color: '#2C3E50' }}>SEA Director</span>
              </div>
              <p style={{ color: '#7F8C8D', fontSize: 14, margin: 0 }}>Social Enterprise Academy</p>
            </div>

            <div style={{ textAlign: 'center', width: '40%', minWidth: 200 }}>
              <div style={{ borderBottom: '1px solid #7F8C8D', paddingBottom: 10, marginBottom: 10, height: 40 }}>
                <span style={{ fontFamily: "'Brush Script MT', cursive", fontSize: 24, color: '#2C3E50' }}>AF Representative</span>
              </div>
              <p style={{ color: '#7F8C8D', fontSize: 14, margin: 0 }}>Africa Forward</p>
            </div>
          </div>

          <p style={{ color: '#BDC3C7', fontSize: 14, marginTop: 40 }}>Date of Completion: {completionDate}</p>
        </div>
      </div>

      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-xl bg-sea-teal px-6 py-3 text-sm font-bold text-white shadow transition hover:brightness-110"
        >
          Print / Save as PDF
        </button>
      </div>
    </div>
  );
}
