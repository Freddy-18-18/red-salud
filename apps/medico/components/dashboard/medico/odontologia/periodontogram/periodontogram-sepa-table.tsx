"use client";

import { PerioToothData, PerioSite } from "@/types/dental";
import { cn } from "@red-salud/core/utils";
import "./periodontogram-sepa.css";

interface PeriodontogramSepaTableProps {
  teeth: Record<number, PerioToothData>;
  onChange: (code: number, site: PerioSite, value: any) => void;
  isReadOnly?: boolean;
}

export function PeriodontogramSepaTable({ teeth, onChange, isReadOnly }: PeriodontogramSepaTableProps) {
  // Códigos de dientes por cuadrante (FDI notation)
  const upperRight = [18, 17, 16, 15, 14, 13, 12, 11]; // Q1
  const upperLeft = [21, 22, 23, 24, 25, 26, 27, 28];  // Q2
  const lowerLeft = [31, 32, 33, 34, 35, 36, 37, 38];  // Q3
  const lowerRight = [48, 47, 46, 45, 44, 43, 42, 41]; // Q4

  const handleInputChange = (toothCode: number, site: PerioSite, field: string, value: any) => {
    if (isReadOnly) return;
    const tooth = teeth[toothCode];
    if (!tooth || tooth.missing) return;
    const measurement = tooth.measurements[site];
    onChange(toothCode, site, { ...measurement, [field]: value });
  };

  const handleToothPropertyChange = (toothCode: number, property: string, value: any) => {
    if (isReadOnly) return;
    onChange(toothCode, "B" as PerioSite, { [property]: value });
  };

  const renderToothInput = (toothCode: number, site: PerioSite, field: string) => {
    const tooth = teeth[toothCode];
    if (!tooth || tooth.missing) return <input type="text" disabled className="sepa-input disabled" />;

    const measurement = tooth.measurements[site];
    const value = measurement?.[field as keyof typeof measurement] || 0;

    return (
      <input
        type="number"
        min="0"
        max="20"
        value={value as number}
        onChange={(e) => handleInputChange(toothCode, site, field, parseInt(e.target.value) || 0)}
        disabled={isReadOnly}
        className="sepa-input"
      />
    );
  };

  const renderClickableIndicator = (toothCode: number, site: PerioSite, field: string, activeClass: string) => {
    const tooth = teeth[toothCode];
    if (!tooth || tooth.missing) return <div className="sepa-indicator disabled"></div>;

    const measurement = tooth.measurements[site];
    const isActive = measurement?.[field as keyof typeof measurement];

    return (
      <div
        className={cn("sepa-indicator", isActive && activeClass)}
        onClick={() => !isReadOnly && handleInputChange(toothCode, site, field, !isActive)}
      />
    );
  };

  const renderMobilityInput = (toothCode: number) => {
    const tooth = teeth[toothCode];
    if (!tooth || tooth.missing) return <input type="text" disabled className="sepa-input-small disabled" />;

    return (
      <input
        type="number"
        min="0"
        max="3"
        value={tooth.mobility || 0}
        onChange={(e) => handleToothPropertyChange(toothCode, "mobility", parseInt(e.target.value) || 0)}
        disabled={isReadOnly}
        className="sepa-input-small"
      />
    );
  };

  const renderPrognosis = (toothCode: number) => {
    const tooth = teeth[toothCode];
    if (!tooth || tooth.missing) return <select disabled className="sepa-select disabled"><option></option></select>;

    return (
      <select
        value={(tooth as any).prognosis || ""}
        onChange={(e) => handleToothPropertyChange(toothCode, "prognosis", e.target.value)}
        disabled={isReadOnly}
        className="sepa-select"
      >
        <option value=""></option>
        <option value="B">Bueno</option>
        <option value="D">Dudoso</option>
        <option value="M">Malo</option>
        <option value="I">Imposible</option>
      </select>
    );
  };

  const renderQuadrantVestibular = (toothCodes: number[], label: string) => (
    <table className="sepa-quadrant-table">
      <tbody>
        <tr>
          <td className="sepa-label">{label}</td>
          {toothCodes.map(code => (
            <td key={code} className="sepa-cell">
              <div className={cn("sepa-tooth-number", teeth[code]?.missing && "tooth-missing")}>{code}</div>
            </td>
          ))}
        </tr>
        <tr>
          <td className="sepa-label"><span>IM</span></td>
          {toothCodes.map(code => (
            <td key={code} className={cn("sepa-cell", teeth[code]?.missing && "sepa-cell-striped")}>
              <div
                className={cn("sepa-indicator", teeth[code]?.implant && "implant-active", teeth[code]?.missing && "disabled")}
                onClick={() => !isReadOnly && !teeth[code]?.missing && handleToothPropertyChange(code, "implant", !teeth[code]?.implant)}
              />
            </td>
          ))}
        </tr>
        <tr>
          <td className="sepa-label"><span>MV</span></td>
          {toothCodes.map(code => (
            <td key={code} className={cn("sepa-cell", teeth[code]?.missing && "sepa-cell-striped")}>
              {renderMobilityInput(code)}
            </td>
          ))}
        </tr>
        <tr>
          <td className="sepa-label"><span>PI</span></td>
          {toothCodes.map(code => (
            <td key={code} className={cn("sepa-cell", teeth[code]?.missing && "sepa-cell-striped")}>
              {renderPrognosis(code)}
            </td>
          ))}
        </tr>
        <tr>
          <td className="sepa-label"><span>FU</span></td>
          {toothCodes.map(code => (
            <td key={code} className={cn("sepa-cell", teeth[code]?.missing && "sepa-cell-striped")}>
              {[16, 17, 18, 26, 27, 28, 36, 37, 38, 46, 47, 48].includes(code) && !teeth[code]?.missing ? (
                <div className="sepa-indicator" />
              ) : null}
            </td>
          ))}
        </tr>
        <tr>
          <td className="sepa-label"><span>SG</span></td>
          {toothCodes.map(code => (
            <td key={code} className={cn("sepa-cell", teeth[code]?.missing && "sepa-cell-striped")}>
              <div className="sepa-three-sites">
                {renderClickableIndicator(code, "MB", "bleeding", "bleeding-active")}
                {renderClickableIndicator(code, "B", "bleeding", "bleeding-active")}
                {renderClickableIndicator(code, "DB", "bleeding", "bleeding-active")}
              </div>
            </td>
          ))}
        </tr>
        <tr>
          <td className="sepa-label"><span>SP</span></td>
          {toothCodes.map(code => (
            <td key={code} className={cn("sepa-cell", teeth[code]?.missing && "sepa-cell-striped")}>
              <div className="sepa-three-sites">
                {renderClickableIndicator(code, "MB", "suppuration", "suppuration-active")}
                {renderClickableIndicator(code, "B", "suppuration", "suppuration-active")}
                {renderClickableIndicator(code, "DB", "suppuration", "suppuration-active")}
              </div>
            </td>
          ))}
        </tr>
        <tr>
          <td className="sepa-label"><span>PL</span></td>
          {toothCodes.map(code => (
            <td key={code} className={cn("sepa-cell", teeth[code]?.missing && "sepa-cell-striped")}>
              <div className="sepa-three-sites">
                {renderClickableIndicator(code, "MB", "plaque", "plaque-active")}
                {renderClickableIndicator(code, "B", "plaque", "plaque-active")}
                {renderClickableIndicator(code, "DB", "plaque", "plaque-active")}
              </div>
            </td>
          ))}
        </tr>
        <tr>
          <td className="sepa-label"><span>MG</span></td>
          {toothCodes.map(code => (
            <td key={code} className={cn("sepa-cell", teeth[code]?.missing && "sepa-cell-striped")}>
              <div className="sepa-three-inputs">
                {renderToothInput(code, "MB", "recession")}
                {renderToothInput(code, "B", "recession")}
                {renderToothInput(code, "DB", "recession")}
              </div>
            </td>
          ))}
        </tr>
        <tr>
          <td className="sepa-label"><span>PS</span></td>
          {toothCodes.map(code => (
            <td key={code} className={cn("sepa-cell", teeth[code]?.missing && "sepa-cell-striped")}>
              <div className="sepa-three-inputs">
                {renderToothInput(code, "MB", "probingDepth")}
                {renderToothInput(code, "B", "probingDepth")}
                {renderToothInput(code, "DB", "probingDepth")}
              </div>
            </td>
          ))}
        </tr>
        <tr>
          <td className="sepa-label sepa-zone-label"><span>V</span></td>
          {toothCodes.map(code => (
            <td key={code} className={cn("sepa-cell sepa-tooth-visual", teeth[code]?.missing && "sepa-cell-striped")}>
              <div className="tooth-image-placeholder">🦷</div>
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  );

  const renderQuadrantLingual = (toothCodes: number[], label: string) => (
    <table className="sepa-quadrant-table">
      <tbody>
        <tr>
          <td className="sepa-label sepa-zone-label"><span>{label}</span></td>
          {toothCodes.map(code => (
            <td key={code} className={cn("sepa-cell sepa-tooth-visual", teeth[code]?.missing && "sepa-cell-striped")}>
              <div className="tooth-image-placeholder">🦷</div>
            </td>
          ))}
        </tr>
        <tr>
          <td className="sepa-label"><span>PS</span></td>
          {toothCodes.map(code => (
            <td key={code} className={cn("sepa-cell", teeth[code]?.missing && "sepa-cell-striped")}>
              <div className="sepa-three-inputs">
                {renderToothInput(code, "ML", "probingDepth")}
                {renderToothInput(code, "L", "probingDepth")}
                {renderToothInput(code, "DL", "probingDepth")}
              </div>
            </td>
          ))}
        </tr>
        <tr>
          <td className="sepa-label"><span>MG</span></td>
          {toothCodes.map(code => (
            <td key={code} className={cn("sepa-cell", teeth[code]?.missing && "sepa-cell-striped")}>
              <div className="sepa-three-inputs">
                {renderToothInput(code, "ML", "recession")}
                {renderToothInput(code, "L", "recession")}
                {renderToothInput(code, "DL", "recession")}
              </div>
            </td>
          ))}
        </tr>
        <tr>
          <td className="sepa-label"><span>PL</span></td>
          {toothCodes.map(code => (
            <td key={code} className={cn("sepa-cell", teeth[code]?.missing && "sepa-cell-striped")}>
              <div className="sepa-three-sites">
                {renderClickableIndicator(code, "ML", "plaque", "plaque-active")}
                {renderClickableIndicator(code, "L", "plaque", "plaque-active")}
                {renderClickableIndicator(code, "DL", "plaque", "plaque-active")}
              </div>
            </td>
          ))}
        </tr>
        <tr>
          <td className="sepa-label"><span>SG</span></td>
          {toothCodes.map(code => (
            <td key={code} className={cn("sepa-cell", teeth[code]?.missing && "sepa-cell-striped")}>
              <div className="sepa-three-sites">
                {renderClickableIndicator(code, "ML", "bleeding", "bleeding-active")}
                {renderClickableIndicator(code, "L", "bleeding", "bleeding-active")}
                {renderClickableIndicator(code, "DL", "bleeding", "bleeding-active")}
              </div>
            </td>
          ))}
        </tr>
        <tr>
          <td className="sepa-label"><span>SP</span></td>
          {toothCodes.map(code => (
            <td key={code} className={cn("sepa-cell", teeth[code]?.missing && "sepa-cell-striped")}>
              <div className="sepa-three-sites">
                {renderClickableIndicator(code, "ML", "suppuration", "suppuration-active")}
                {renderClickableIndicator(code, "L", "suppuration", "suppuration-active")}
                {renderClickableIndicator(code, "DL", "suppuration", "suppuration-active")}
              </div>
            </td>
          ))}
        </tr>
        <tr>
          <td className="sepa-label"><span>NT</span></td>
          {toothCodes.map(code => (
            <td key={code} className={cn("sepa-cell", teeth[code]?.missing && "sepa-cell-striped")}>
              <textarea
                className="sepa-note"
                maxLength={80}
                disabled={isReadOnly || teeth[code]?.missing}
                placeholder=""
              />
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  );

  return (
    <div className="sepa-table-wrapper">
      {/* ARCO SUPERIOR */}
      <div className="sepa-section-header">ARCO SUPERIOR</div>
      <div className="sepa-arch-container">
        {/* Q1: 18-11 (Superior Derecho) */}
        {renderQuadrantVestibular(upperRight, "Diente")}
        {renderQuadrantLingual(upperRight, "P")}

        {/* Q2: 21-28 (Superior Izquierdo) */}
        {renderQuadrantVestibular(upperLeft, "Diente")}
        {renderQuadrantLingual(upperLeft, "P")}
      </div>

      {/* ARCO INFERIOR */}
      <div className="sepa-section-header">ARCO INFERIOR</div>
      <div className="sepa-arch-container">
        {/* Q4: 48-41 (Inferior Derecho) */}
        {renderQuadrantLingual(lowerRight, "L")}
        {renderQuadrantVestibular(lowerRight, "Diente")}

        {/* Q3: 31-38 (Inferior Izquierdo) */}
        {renderQuadrantLingual(lowerLeft, "L")}
        {renderQuadrantVestibular(lowerLeft, "Diente")}
      </div>
    </div>
  );
}
