import { Seo } from "../components/Seo";
import { PageHero } from "../components/PageHero";
import { Section } from "../components/Section";
import { Pending } from "../components/Pending";
import { ContactsBlock } from "../components/ContactsBlock";
import { Button } from "../components/Button";
import { SEO } from "../content/seo";
import { ABOUT_HERO, ABOUT_PENDING } from "../content/about";

export default function AboutPage() {
  return (
    <>
      <Seo page={SEO["/about/"]} />
      <PageHero
        breadcrumb="О нас"
        title={ABOUT_HERO.title}
        lead={ABOUT_HERO.lead}
        actions={
          <>
            <Button to="/obuchen/" variant="secondary">
              Обучение и консультация
            </Button>
            <Button to="#contacts">Контакты</Button>
          </>
        }
      />
      <Section id="about-content">
        <Pending items={ABOUT_PENDING} />
      </Section>
      <ContactsBlock />
    </>
  );
}
