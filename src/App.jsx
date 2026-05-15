import { useEffect, useState } from "react";
import jsPDF from "jspdf";

export default function App() {
  const ANCHO_PLANCHA = 3600;
  const ALTO_PLANCHA = 2600;
  const ESCALA = 0.18;

  const [cliente, setCliente] = useState("");
  const [trabajo, setTrabajo] = useState("");

  const [ancho, setAncho] = useState("");
  const [alto, setAlto] = useState("");
  const [cantidad, setCantidad] = useState(1);

  const [piezas, setPiezas] = useState([]);
  const [resultado, setResultado] = useState([]);

  const [presupuestos, setPresupuestos] =
    useState([]);

  useEffect(() => {
    const guardados =
      JSON.parse(
        localStorage.getItem(
          "presupuestos"
        )
      ) || [];

    setPresupuestos(guardados);
  }, []);

  const agregarPieza = () => {
    if (!ancho || !alto) return;

    const nuevas = [];

    for (let i = 0; i < cantidad; i++) {
      nuevas.push({
        id: Date.now() + i,
        ancho: Number(ancho),
        alto: Number(alto),
      });
    }

    setPiezas([...piezas, ...nuevas]);

    setAncho("");
    setAlto("");
    setCantidad(1);
  };

  const eliminarPieza = (id) => {
    setPiezas(
      piezas.filter((p) => p.id !== id)
    );
  };

  const generarCortes = () => {
    let piezasOrdenadas = [...piezas].sort(
      (a, b) => {
        return (
          b.ancho * b.alto -
          a.ancho * a.alto
        );
      }
    );

    let resultadoFinal = [];

    let hojaActual = 1;

    let skylines = {
      1: [
        {
          x: 0,
          y: 0,
          width: ANCHO_PLANCHA,
        },
      ],
    };

    const limpiarSkyline = (skyline) => {
      return skyline.filter((nodo) => {
        return (
          nodo.width > 0 &&
          nodo.x < ANCHO_PLANCHA &&
          nodo.y < ALTO_PLANCHA
        );
      });
    };

    const buscarMejorPosicion = (
      pieza,
      skyline
    ) => {
      let mejor = null;

      let opciones = [
        {
          ancho: pieza.ancho,
          alto: pieza.alto,
        },
        {
          ancho: pieza.alto,
          alto: pieza.ancho,
        },
      ];

      opciones.forEach((opcion) => {
        skyline.forEach((nodo, index) => {
          if (
            opcion.ancho <= nodo.width
          ) {
            let sobraHorizontal =
              nodo.width -
              opcion.ancho;

            let alturaFinal =
              nodo.y + opcion.alto;

            if (
              alturaFinal <=
              ALTO_PLANCHA
            ) {
              if (
                !mejor ||
                alturaFinal <
                  mejor.altura ||
                (alturaFinal ===
                  mejor.altura &&
                  sobraHorizontal <
                    mejor.sobra)
              ) {
                mejor = {
                  index,
                  x: nodo.x,
                  y: nodo.y,
                  ancho:
                    opcion.ancho,
                  alto:
                    opcion.alto,
                  altura:
                    alturaFinal,
                  sobra:
                    sobraHorizontal,
                };
              }
            }
          }
        });
      });

      return mejor;
    };

    piezasOrdenadas.forEach(
      (pieza) => {
        let colocada = false;

        for (
          let hoja = 1;
          hoja <= hojaActual;
          hoja++
        ) {
          let skyline =
            skylines[hoja];

          let mejor =
            buscarMejorPosicion(
              pieza,
              skyline
            );

          if (mejor) {
            resultadoFinal.push({
              ...pieza,
              x: mejor.x,
              y: mejor.y,
              ancho: mejor.ancho,
              alto: mejor.alto,
              hoja,
            });

            skyline[mejor.index] = {
              x:
                mejor.x +
                mejor.ancho,
              y: mejor.y,
              width:
                skyline[
                  mejor.index
                ].width -
                mejor.ancho,
            };

            skyline.push({
              x: mejor.x,
              y:
                mejor.y +
                mejor.alto,
              width: mejor.ancho,
            });

            skyline.sort((a, b) => {
              if (a.y === b.y) {
                return a.x - b.x;
              }

              return a.y - b.y;
            });

            skylines[hoja] =
              limpiarSkyline(
                skyline
              );

            colocada = true;
            break;
          }
        }

        if (!colocada) {
          hojaActual++;

          resultadoFinal.push({
            ...pieza,
            x: 0,
            y: 0,
            ancho: pieza.ancho,
            alto: pieza.alto,
            hoja: hojaActual,
          });

          skylines[hojaActual] = [
            {
              x: pieza.ancho,
              y: 0,
              width:
                ANCHO_PLANCHA -
                pieza.ancho,
            },
          ];
        }
      }
    );

    setResultado(resultadoFinal);
  };

  const guardarPresupuesto = () => {
    const nuevo = {
      id: Date.now(),
      cliente,
      trabajo,
      piezas,
      resultado,
      fecha:
        new Date().toLocaleDateString(),
    };

    const actualizados = [
      ...presupuestos,
      nuevo,
    ];

    setPresupuestos(actualizados);

    localStorage.setItem(
      "presupuestos",
      JSON.stringify(actualizados)
    );

    alert("Presupuesto guardado");
  };

  const eliminarPresupuesto = (id) => {
    const actualizados =
      presupuestos.filter(
        (p) => p.id !== id
      );

    setPresupuestos(actualizados);

    localStorage.setItem(
      "presupuestos",
      JSON.stringify(actualizados)
    );
  };

  const cargarPresupuesto = (p) => {
    setCliente(p.cliente);
    setTrabajo(p.trabajo);
    setPiezas(p.piezas);
    setResultado(p.resultado);
  };

  const exportarPDF = () => {
    const pdf = new jsPDF();

    pdf.setFontSize(18);

    pdf.text(
      "Graziano Vidrios",
      20,
      20
    );

    pdf.setFontSize(12);

    pdf.text(
      `Cliente: ${cliente}`,
      20,
      40
    );

    pdf.text(
      `Trabajo: ${trabajo}`,
      20,
      50
    );

    let yPDF = 70;

    piezas.forEach((p, index) => {
      pdf.text(
        `${index + 1}) ${
          p.ancho
        } x ${p.alto}`,
        20,
        yPDF
      );

      yPDF += 8;
    });

    pdf.save(
      `Presupuesto-${cliente}.pdf`
    );
  };

  const hojasUsadas =
    resultado.length > 0
      ? Math.max(
          ...resultado.map(
            (p) => p.hoja
          )
        )
      : 1;

  return (
    <div
      style={{
        padding: 20,
        fontFamily: "Arial",
        background: "#f4f4f4",
        minHeight: "100vh",
      }}
    >
      <h1>Graziano Vidrios</h1>

      <div
        style={{
          background: "white",
          padding: 15,
          borderRadius: 10,
          marginBottom: 20,
        }}
      >
        <h2>Cliente</h2>

        <input
          type="text"
          placeholder="Cliente"
          value={cliente}
          onChange={(e) =>
            setCliente(e.target.value)
          }
          style={{
            marginRight: 10,
            padding: 8,
          }}
        />

        <input
          type="text"
          placeholder="Trabajo"
          value={trabajo}
          onChange={(e) =>
            setTrabajo(e.target.value)
          }
          style={{
            padding: 8,
          }}
        />
      </div>

      <div
        style={{
          background: "white",
          padding: 15,
          borderRadius: 10,
          marginBottom: 20,
        }}
      >
        <h2>Agregar pieza</h2>

        <input
          type="number"
          placeholder="Ancho"
          value={ancho}
          onChange={(e) =>
            setAncho(e.target.value)
          }
          style={{
            marginRight: 10,
            padding: 8,
          }}
        />

        <input
          type="number"
          placeholder="Alto"
          value={alto}
          onChange={(e) =>
            setAlto(e.target.value)
          }
          style={{
            marginRight: 10,
            padding: 8,
          }}
        />

        <input
          type="number"
          placeholder="Cantidad"
          value={cantidad}
          onChange={(e) =>
            setCantidad(
              Number(e.target.value)
            )
          }
          style={{
            width: 80,
            marginRight: 10,
            padding: 8,
          }}
        />

        <button onClick={agregarPieza}>
          Agregar
        </button>
      </div>

      <div
        style={{
          background: "white",
          padding: 15,
          borderRadius: 10,
          marginBottom: 20,
        }}
      >
        <h2>Piezas</h2>

        {piezas.map((p) => (
          <div
            key={p.id}
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              borderBottom:
                "1px solid #ddd",
              padding: 5,
            }}
          >
            <span>
              {p.ancho} x {p.alto}
            </span>

            <button
              onClick={() =>
                eliminarPieza(p.id)
              }
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 20 }}>
        <button
          onClick={generarCortes}
          style={{
            marginRight: 10,
            padding: 12,
          }}
        >
          Generar cortes
        </button>

        <button
          onClick={guardarPresupuesto}
          style={{
            marginRight: 10,
            padding: 12,
          }}
        >
          Guardar presupuesto
        </button>

        <button
          onClick={exportarPDF}
          style={{
            padding: 12,
          }}
        >
          Exportar PDF
        </button>
      </div>

      {resultado.length > 0 && (
        <div
          style={{
            background: "white",
            padding: 15,
            borderRadius: 10,
            marginBottom: 20,
          }}
        >
          <h2>Resultado</h2>

          <p>
            Hojas usadas: {
              hojasUsadas
            }
          </p>

          {[...new Set(
            resultado.map(
              (p) => p.hoja
            )
          )].map((hoja) => (
            <div
              key={hoja}
              style={{
                marginBottom: 40,
              }}
            >
              <h3>Hoja {hoja}</h3>

              <div
                style={{
                  position: "relative",
                  width:
                    ANCHO_PLANCHA *
                    ESCALA,
                  height:
                    ALTO_PLANCHA *
                    ESCALA,
                  border:
                    "3px solid black",
                  background: "#e5e5e5",
                  overflow: "hidden",
                }}
              >
                {resultado
                  .filter(
                    (p) =>
                      p.hoja === hoja
                  )
                  .map((p) => (
                    <div
                      key={p.id}
                      style={{
                        position:
                          "absolute",
                        left:
                          p.x * ESCALA,
                        top:
                          p.y * ESCALA,
                        width:
                          p.ancho *
                          ESCALA,
                        height:
                          p.alto *
                          ESCALA,
                        background:
                          "#4da6ff",
                        border:
                          "1px solid black",
                        display: "flex",
                        justifyContent:
                          "center",
                        alignItems:
                          "center",
                        fontSize: 10,
                        overflow:
                          "hidden",
                        textAlign:
                          "center",
                      }}
                    >
                      {p.ancho}x
                      {p.alto}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div
        style={{
          background: "white",
          padding: 15,
          borderRadius: 10,
        }}
      >
        <h2>
          Presupuestos guardados
        </h2>

        {presupuestos.map((p) => (
          <div
            key={p.id}
            style={{
              borderBottom:
                "1px solid #ddd",
              padding: 10,
              marginBottom: 5,
            }}
          >
            <strong>
              {p.cliente}
            </strong>{" "}
            - {p.trabajo}

            <br />

            <small>{p.fecha}</small>

            <br />

            <button
              onClick={() =>
                cargarPresupuesto(p)
              }
              style={{
                marginTop: 5,
                marginRight: 10,
              }}
            >
              Cargar
            </button>

            <button
              onClick={() =>
                eliminarPresupuesto(
                  p.id
                )
              }
              style={{
                background: "#ff4d4d",
                color: "white",
              }}
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}