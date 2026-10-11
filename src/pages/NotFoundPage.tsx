import { useLocation } from "react-router-dom";
import { Seo } from "../components/Seo";
import { PageHero } from "../components/PageHero";
import { Button } from "../components/Button";

export default function NotFoundPage() {
  const { pathname } = useLocation();
  return (
    <>
      <Seo title="Страница не найдена — CloudRepairs" description="Запрошенная страница не найдена." path={pathname} noindex />
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
