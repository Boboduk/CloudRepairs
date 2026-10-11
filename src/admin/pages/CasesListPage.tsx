import type { CaseDto } from "../api";
import { OrderedList } from "../components/OrderedList";

export default function CasesListPage() {
  return (
    <OrderedList<CaseDto>
      endpoint="/cases"
      title="Кейсы"
      sub="Проекты в блоке «Кейсы» на главной странице. Порядок в списке совпадает с порядком на сайте."
      noun={{ one: "кейс", deleted: "Кейс удалён", published: "Кейс опубликован", unpublished: "Кейс снят с публикации" }}
      addLabel="Добавить кейс"
      image={(r) => r.cover}
      extra={(r) => [r.client, r.excerpt].filter(Boolean).join(" · ").slice(0, 100)}
      publicHref={() => "/#cases"}
    />
  );
}
