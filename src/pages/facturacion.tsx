import Facturacion from "@/components/Facturacion/Facturacion";
import GeneralLayout from "@/components/GeneralLayout";

function FacturacionPage() {

  return <Facturacion />
}

FacturacionPage.getLayout = (page: React.ReactElement) => {
    return <GeneralLayout>{page}</GeneralLayout>;
  };

  export default FacturacionPage;