

import Ambulancia from '@/components/Ambulancia';
import GeneralLayout from '@/components/GeneralLayout';


function AmbulanciaPage() {
// Then use this type for your page component:

    return (
        <div className="container mx-auto px-4 py-8">
          <Ambulancia />
        </div>
      );
      
     
    } 
    AmbulanciaPage.getLayout = (page: React.ReactElement) => {
        return <GeneralLayout>{page}</GeneralLayout>;
      };
        export default AmbulanciaPage;