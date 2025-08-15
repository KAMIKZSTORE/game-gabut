<script>
  // ====== GANTI DENGAN PUNYAMU (EmailJS) ======
  const EMAILJS_PUBLIC_KEY = 'toe1V0T6UlCZBtw_4';
  const EMAILJS_SERVICE_ID = 'service_faxghxt';
  const EMAILJS_TEMPLATE_ID = 'template_q4ynojp';
  // =============================================

  // init SDK
  (function(){ try { emailjs.init({ publicKey: toe1V0T6UlCZBtw_4 }); } catch(e) { console.error(e); } })();

  // kirim email ringkasan
  window.sendAdminEmail = async function(payload) {
    try {
      const params = {
        subject: `Device log baru — ${payload.ip || '-'} (${payload.merek || payload.platform || 'Perangkat'})`,
        ...payload
      };
      const res = await emailjs.send(service_faxghxt, template_q4ynojp, params);
      console.log('EmailJS OK:', res.status, res.text);
      return true;
    } catch (err) {
      console.error('EmailJS error:', err);
      return false;
    }
  }
</script>
