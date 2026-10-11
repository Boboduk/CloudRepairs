import { Seo } from "../components/Seo";
import { PageHero } from "../components/PageHero";
import { Button } from "../components/Button";
import { NOT_FOUND_SEO } from "../content/seo";

export default function NotFoundPage() {
  return (
    <>
      <Seo page={NOT_FOUND_SEO} />
      <PageHero
        eyebrow="Ошибка 404"
        title="Страница не найдена"
        lead="Проверьте адрес или перейдите на главную страницу."
        actions={
          <>
            <Button to="/" size="lg">
              На главную
            </Button>
            <Button to="/vnutyankaya-training/" variant="outlineLight" size="lg">
              О продукте
            </Button>
          </>
        }
      />
    </>
  );
}
