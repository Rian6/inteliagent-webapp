export function planningReportErrors(
  plan: any,
  catalog: any,
): Record<string, string> {
  const errors: Record<string, string> = {};
  const b =
    plan.boletim ||
    (() => {
      try {
        return JSON.parse(plan.boletimJson || plan.BOLETIM_JSON || "{}");
      } catch {
        return {};
      }
    })();
  const upper:Record<string,string>={idCidade:'ID_CIDADE',idCategoria:'ID_CATEGORIA',atividade:'ATIVIDADE',tipo:'TIPO'};
  for(const [key,list,label] of [['idCidade','municipios','município'],['idCategoria','categorias','categoria da localidade'],['atividade','atividades','atividade'],['tipo','tipos','tipo da localidade']]){
    if(!catalog[list].some((r:any)=>r.value===Number(plan[key]??plan[upper[key]])))errors[key]='Selecione '+label+'.';
  }
  if (!String(plan.nome ?? plan.nomeRegiao ?? plan.NOME ?? "").trim())
    errors.nome = "Informe o nome da localidade.";
  if (!String(plan.zona ?? plan.ZONA ?? "").trim())
    errors.zona = "Informe a zona.";
  if (!/^\d{4}($|-)/.test(String(plan.ano ?? plan.ANO ?? "")))
    errors.ano = "Informe o ano com quatro dígitos.";
  const cycle = plan.ciclo ?? plan.CICLO;
  if (
    cycle == null ||
    cycle === "" ||
    !Number.isInteger(Number(cycle)) ||
    Number(cycle) < 0 ||
    Number(cycle) > 99
  )
    errors.ciclo = "Informe um ciclo de 0 a 99.";
  if (
    !String(b.codigoLocalidade || "").trim() ||
    String(b.codigoLocalidade).trim().length > 32
  )
    errors.codigoLocalidade =
      "Informe o código oficial da localidade (até 32 caracteres).";
  if (
    b.municipioIbge &&
    Number(b.municipioIbge) !== Number(plan.idCidade ?? plan.ID_CIDADE)
  )
    errors.idCidade =
      "O município do boletim deve ser o mesmo do planejamento.";
  for (const [key, field] of [
    ["atividade", "atividade"],
    ["tipoLocalidade", "tipo"],
  ])
    if (
      b[key] &&
      Number(b[key]) !== Number(plan[field] ?? plan[field.toUpperCase()])
    )
      errors[field] = "Use a classificação do planejamento no boletim.";
  const category = catalog.categorias.find(
    (r: any) => r.value === Number(plan.idCategoria ?? plan.ID_CATEGORIA),
  );
  if (b.categoriaLocalidade && b.categoriaLocalidade !== category?.code)
    errors.idCategoria = "Use a categoria do planejamento no boletim.";
  return errors;
}
export function requirePlanningReport(plan: any, catalog: any) {
  const errors = planningReportErrors(plan, catalog);
  if (Object.keys(errors).length)
    throw new Error(Object.values(errors).join(" "));
}
