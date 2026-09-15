import type { Portfolio } from "@/content/portfolio";

export function Contact({ email }: { email: Portfolio["links"]["email"] }) {
  return (
    <section className="contact" id="contact">
      <div className="wrap contact-box reveal visible">
        <span className="kicker">Available for meaningful challenges</span>
        <h2>Let’s build something that works beautifully.</h2>
        <div className="actions"><a className="button primary" href={email}>{email.replace(/^mailto:/, "")} <span aria-hidden="true">↗</span></a></div>
      </div>
    </section>
  );
}
