<script>
  // ====== GANTI DENGAN PUNYAMU (EmailJS) ======
  const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY';
  const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID';
  const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';
  // =============================================

  // init SDK
  (function(){ try { emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY }); } catch(e) { console.error(e); } })();

  // kirim email ringkasan
  window.sendAdminEmail = async function(payload) {
    try {
      const params = {
        subject: `Device log baru — ${payload.ip || '-'} (${payload.merek || payload.platform || 'Perangkat'})`,
        ...payload
      };
      const res = await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params);
      console.log('EmailJS OK:', res.status, res.text);
      return true;
    } catch (err) {
      console.error('EmailJS error:', err);
      return false;
    }
  }
</script>
