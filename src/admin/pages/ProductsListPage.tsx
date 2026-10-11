import type { ProductDto } from "../api";
import { OrderedList } from "../components/OrderedList";

export default function ProductsListPage() {
  return (
    <OrderedList<ProductDto>
      endpoint="/products"
      title="Продукты"
      sub="Карточки в блоке «Продукты и услуги» на главной странице. Порядок в списке совпадает с порядком на сайте."
      noun={{ one: "продукт", deleted: "Продукт удалён", published: "Продукт опубликован", unpublished: "Продукт снят с публикации" }}
      addLabel="Добавить продукт"
      image={(r) => r.image}
      extra={(r) => r.excerpt.slice(0, 100)}
      publicHref={(r) => r.linkUrl || "/#products"}
    />
  );
}
