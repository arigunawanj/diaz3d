const STEPS = [
  { n: '01 / DESAIN', t: 'Susun dekorasimu', d: 'Mulai dari template ulang tahun anak, sweet 17, atau formal. Ganti backdrop, balon, dan properti sesukamu.' },
  { n: '02 / LIHAT', t: 'Lihat dalam 3D', d: 'Putar panggung, seret properti ke posisi yang pas, dan lihat estimasi biaya berubah seketika.' },
  { n: '03 / AJUKAN', t: 'Kirim ke tim kami', d: 'Ajukan desainmu. Admin memeriksa harga final dan mengirimkannya langsung ke WhatsApp kamu.' },
];

export const HowItWorks = () => (
  <section className="how" id="cara-kerja">
    <h2>Dari ide <span>ke panggung.</span></h2>
    <ol>
      {STEPS.map((s) => (
        <li key={s.n}>
          <small>{s.n}</small>
          <h3>{s.t}</h3>
          <p>{s.d}</p>
        </li>
      ))}
    </ol>
  </section>
);
