export const evaluateRisk = async ({ payee, amount, smsContext }) => {
  const response = await fetch('http://localhost:8000/v1/risk/eval', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ payee, amount, sms_context: smsContext }),
  });

  return response.json();
};
