export class CalculatorService {
  /**
   * Transposición de cilindro positivo ↔ negativo
   * Fórmula: Nuevo Esfera = Esfera Original + Cilindro
   *          Nuevo Cilindro = -Cilindro Original
   *          Nuevo Eje = Eje Original + 90°
   */
  static transposeCylinder(sphere: number, cylinder: number, axis: number) {
    const newSphere = sphere + cylinder;
    const newCylinder = -cylinder;
    let newAxis = axis + 90;
    if (newAxis >= 180) {
      newAxis -= 180;
    }

    return {
      sphere: parseFloat(newSphere.toFixed(2)),
      cylinder: parseFloat(newCylinder.toFixed(2)),
      axis: parseFloat(newAxis.toFixed(0)),
      formula: 'Esfera Final = Esfera + Cilindro | Cilindro Final = -Cilindro | Eje Final = Eje + 90°',
    };
  }

  /**
   * Equivalente Esférico
   * Fórmula: EE = Esfera + (Cilindro / 2)
   */
  static sphericalEquivalent(sphere: number, cylinder: number) {
    const ee = sphere + cylinder / 2;
    return {
      value: parseFloat(ee.toFixed(2)),
      formula: 'EE = Esfera + (Cilindro ÷ 2)',
    };
  }

  /**
   * Conversión de receta entre diferentes formatos
   */
  static convertPrescription(
    sphere: number,
    cylinder: number,
    axis: number,
    format: 'positive' | 'negative'
  ) {
    if (format === 'positive') {
      return this.transposeCylinder(sphere, cylinder, axis);
    } else {
      return this.transposeCylinder(sphere, cylinder, axis);
    }
  }

  /**
   * Conversión relacionada con distancia de vértice
   * Fórmula: Esfera Final = Esfera / (1 - (distancia_mm / 1000) * Esfera)
   */
  static vertexDistanceConversion(
    sphere: number,
    distanceMm: number,
    targetDistance: number
  ) {
    const distance = distanceMm / 1000;
    const sphereFinal = sphere / (1 - distance * sphere);
    const adjustment = sphereFinal - sphere;

    return {
      originalSphere: parseFloat(sphere.toFixed(2)),
      finalSphere: parseFloat(sphereFinal.toFixed(2)),
      adjustment: parseFloat(adjustment.toFixed(2)),
      formula: 'Esfera Final = Esfera / (1 - (distancia/1000) × Esfera)',
    };
  }
}
