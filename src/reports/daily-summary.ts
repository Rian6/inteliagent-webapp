export const depositTypes = ["A1", "A2", "B", "C", "D1", "D2", "E"];
export const laboratorySpecies = [
  ["aegypti", "Aedes aegypti"],
  ["albopictus", "Aedes albopictus"],
  ["outras", "Outras espécies"],
] as const;
const number = (v: any) => {
  const n = Number(String(v ?? 0).replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};
export function laboratoryErrors(metadata: any): Record<string, string> {
  const errors: Record<string, string> = {},
    lab = metadata?.laboratorio;
  if (!lab?.concluido) return errors;
  for (const key of ["dataEntrada", "dataConclusao"])
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(lab[key] || "") ||
      !Number.isFinite(Date.parse(lab[key])) ||
      new Date(lab[key]).toISOString().slice(0, 10) !== lab[key]
    )
      errors["boletim.laboratorio." + key] =
        "Informe uma data válida (AAAA-MM-DD).";
  if (
    lab.dataEntrada &&
    lab.dataConclusao &&
    lab.dataConclusao < lab.dataEntrada
  )
    errors["boletim.laboratorio.dataConclusao"] =
      "A conclusão não pode ser anterior à entrada.";
  for (const key of ["nome", "laboratorista"])
    if (!String(lab[key] || "").trim())
      errors["boletim.laboratorio." + key] =
        "Preencha a identificação do laboratório e do laboratorista.";
  for (const [species] of laboratorySpecies) {
    const result = lab[species] || {};
    for (const [key, value] of Object.entries({
      ...result.depositos,
      ...Object.fromEntries(
        ["larvas", "pupas", "exuvias", "adultos"].map((k) => [
          k,
          result[k] ?? 0,
        ]),
      ),
    })) {
      const n = Number(value ?? 0);
      if (!Number.isSafeInteger(n) || n < 0 || n > 1000000)
        errors["boletim.laboratorio." + species + "." + key] =
          "Use um número inteiro entre 0 e 1000000.";
    }
  }
  return errors;
}
export function summarizeReportRows(rows: any[]) {
  const sum = (key: string) =>
    rows.reduce((n, r) => n + number(r.values[key]), 0);
  const worked = rows.filter((r) => r.status === 3),
    labs = worked.filter((r) => r.b.laboratorio?.concluido === true);
  const unique = (values: any[]) =>
    [...new Set(values.filter((v) => v != null && v !== ""))].sort((a, b) =>
      String(a).localeCompare(String(b), "pt-BR", { numeric: true }),
    );
  const propertyTypes = ["R", "C", "TB", "PE", "O"];
  const positive = (lab: any, key: string) =>
    Object.values(lab?.[key]?.depositos || {}).some((n) => number(n) > 0) ||
    ["larvas", "pupas", "exuvias", "adultos"].some(
      (k) => number(lab?.[key]?.[k]) > 0,
    );
  return {
    total: rows.length,
    worked: worked.length,
    properties: propertyTypes.map(
      (type) => worked.filter((r) => r.values.tipo === type).length,
    ),
    focal: worked.filter((r) => !!r.values.f1tipo || !!r.values.f2tipo).length,
    perifocal: worked.filter((r) => !!r.values.peritipo).length,
    inspected: worked.filter(
      (r) =>
        r.values.li === "X" ||
        depositTypes.some((_, i) => number(r.values["d" + (i + 1)]) > 0),
    ).length,
    recovered: worked.filter((r) => r.values.visita === "R").length,
    tubes: sum("tubos"),
    closed: rows.filter((r) => r.status === 1).length,
    refused: rows.filter((r) => r.status === 2).length,
    deposits: depositTypes.map((_, i) => sum("d" + (i + 1))),
    eliminated: sum("eliminados"),
    informed: worked.filter((r) => r.b.imovelInformado === true).length,
    quarters: unique(worked.map((r) => r.b.quarteirao)),
    completedQuarters: unique(
      worked
        .filter((r) => r.b.quarteiraoConcluido === true)
        .map((r) => r.b.quarteirao),
    ),
    focalProducts: unique(
      rows.flatMap((r) => [r.values.f1tipo, r.values.f2tipo]),
    ).map((tipo) => ({
      tipo,
      gramas: rows.reduce(
        (n, r) =>
          n +
          (r.values.f1tipo === tipo ? number(r.values.f1gramas) : 0) +
          (r.values.f2tipo === tipo ? number(r.values.f2gramas) : 0),
        0,
      ),
      depositos: rows.reduce(
        (n, r) =>
          n +
          (r.values.f1tipo === tipo ? number(r.values.f1dep) : 0) +
          (r.values.f2tipo === tipo ? number(r.values.f2dep) : 0),
        0,
      ),
    })),
    adulticides: unique(rows.map((r) => r.values.peritipo)).map((tipo) => ({
      tipo,
      cargas: rows
        .filter((r) => r.values.peritipo === tipo)
        .reduce((n, r) => n + number(r.values.pericarga), 0),
    })),
    labCount: labs.length,
    labs: unique(labs.map((r) => r.b.laboratorio.nome)),
    technicians: unique(labs.map((r) => r.b.laboratorio.laboratorista)),
    entryDates: unique(labs.map((r) => r.b.laboratorio.dataEntrada)),
    completionDates: unique(labs.map((r) => r.b.laboratorio.dataConclusao)),
    species: laboratorySpecies.map(([key, label]) => ({
      key,
      label,
      quarters: unique(
        labs
          .filter((r) => positive(r.b.laboratorio, key))
          .map((r) => r.b.quarteirao),
      ),
      deposits: depositTypes.map((type) =>
        labs.reduce(
          (n, r) => n + number(r.b.laboratorio[key]?.depositos?.[type]),
          0,
        ),
      ),
      properties: propertyTypes.map(
        (type) =>
          labs.filter(
            (r) => r.values.tipo === type && positive(r.b.laboratorio, key),
          ).length,
      ),
      specimens: ["larvas", "pupas", "exuvias", "adultos"].map((k) =>
        labs.reduce((n, r) => n + number(r.b.laboratorio[key]?.[k]), 0),
      ),
    })),
  };
}
