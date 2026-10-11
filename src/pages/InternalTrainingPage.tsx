import { Seo } from "../components/Seo";
import { PageHero } from "../components/PageHero";
import { Section } from "../components/Section";
import { Pending } from "../components/Pending";
import { Gallery } from "../components/Gallery";
import { ContactsBlock } from "../components/ContactsBlock";
import { Button } from "../components/Button";
import { SEO } from "../content/seo";
import { INTERNAL_GALLERY, INTERNAL_HERO, INTERNAL_PENDING } from "../content/internalTraining";

export default function InternalTrainingPage() {
  return (
    <>
      <Seo page={SEO["/vnutyankaya-training/"]} />
      <PageHero
        breadcrumb="Внутреннее обучение"
        title={INTERNAL_HERO.title}
        lead={INTERNAL_HERO.lead}
        actions={
          <Button to="/obuchen/" variant="secondary">
            Обучение и консультация
          </Button>
        }
      />
      {INTERNAL_GALLERY.length > 0 && (
        <Section id="materials" title="Материалы">
          <Gallery images={INTERNAL_GALLERY} />
        </Section>
      )}
      <Section id="internal-content">
        <Pending items={INTERNAL_PENDING} />
      </Section>
      <ContactsBlock />
    </>
  );
}
