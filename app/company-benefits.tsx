import {Cog, SlidersHorizontal, Cpu} from 'lucide-react';

export function CompanyBenefits({en}:{en:boolean}) {
  const t=(uk:string,english:string)=>en?english:uk;
  return (<div className="benefits">
          {[Cog, SlidersHorizontal, Cpu].map((Icon, i) => (
            <div key={i}>
              <Icon size={20} strokeWidth={1.5} />
              <div>
                <h3>
                  {
                    [
                      t('Інженерія', 'Engineering'),
                      t('Автоматизація', 'Automation'),
                      t('Інтелект', 'Intelligence'),
                    ][i]
                  }
                </h3>
                <p>
                  {
                    [
                      t(
                        'Машинобудування, механічне проєктування й обладнання.',
                        'Mechanical engineering, machinery and equipment design.',
                      ),
                      t(
                        'Системи керування, PLC та HMI як частина продукту.',
                        'Control systems, PLC and HMI as part of the product.',
                      ),
                      t(
                        'Власне ПЗ, дані та дистанційний моніторинг.',
                        'Proprietary software, data and remote monitoring.',
                      ),
                    ][i]
                  }
                </p>
              </div>
            </div>
          ))}
        </div>);
}
