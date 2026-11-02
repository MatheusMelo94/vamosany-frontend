import { elSubteExplicado } from "@/features/guias/content/guides/el-subte-explicado";
import { desdeElAeropuerto } from "@/features/guias/content/guides/desde-el-aeropuerto";
import { caminarPorNewYork } from "@/features/guias/content/guides/caminar-por-new-york";
import { comoMovertePorNewYork } from "@/features/guias/content/guides/como-moverte-por-new-york";
import { westVillage } from "@/features/guias/content/guides/west-village";
import { murrayHill } from "@/features/guias/content/guides/murray-hill";
import { financialDistrict } from "@/features/guias/content/guides/financial-district";
import { williamsburg } from "@/features/guias/content/guides/williamsburg";
import { visaAEstadosUnidos } from "@/features/guias/content/guides/visa-a-estados-unidos";
import { cuantoCuestaUnDiaEnNewYork } from "@/features/guias/content/guides/cuanto-cuesta-un-dia-en-new-york";
import { queLlevarSegunLaTemporada } from "@/features/guias/content/guides/que-llevar-segun-la-temporada";
import { entradasParaBroadway } from "@/features/guias/content/guides/entradas-para-broadway";
import type { GuideSlug } from "@/features/guias/content/slugs";
import type { GuideBody } from "@/features/guias/types";

/**
 * Guide bodies by slug, one module each (plan D-2). Partial while the guides
 * land one task at a time; GU-17 tightens it to `Record<GuideSlug,
 * GuideBody>` so a missing guide is a compile error.
 */
export const BODIES: Partial<Record<GuideSlug, GuideBody>> = {
  "el-subte-explicado": elSubteExplicado,
  "desde-el-aeropuerto": desdeElAeropuerto,
  "caminar-por-new-york": caminarPorNewYork,
  "como-moverte-por-new-york": comoMovertePorNewYork,
  "west-village": westVillage,
  "murray-hill": murrayHill,
  "financial-district": financialDistrict,
  williamsburg: williamsburg,
  "visa-a-estados-unidos": visaAEstadosUnidos,
  "cuanto-cuesta-un-dia-en-new-york": cuantoCuestaUnDiaEnNewYork,
  "que-llevar-segun-la-temporada": queLlevarSegunLaTemporada,
  "entradas-para-broadway": entradasParaBroadway,
};
