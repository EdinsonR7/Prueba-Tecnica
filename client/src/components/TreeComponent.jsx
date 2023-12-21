import Tree from 'react-d3-tree';
import PropTypes from 'prop-types';
import { useState } from 'react';

const TreeComponent = ({ data }) => {
  const treeContainerStyle = { width: '100%', height: '100%' };

  const convertirDatosParaArbol = (datos) => {
    return {
      name: 'Raíz',
      children: datos.map((señal) => ({
        name: señal.nombre,
        attributes: {
          mmspath: señal.mmspath,
          // Incluye más atributos según tus necesidades
        },
      })),
    };
  };

  const datosParaArbol = convertirDatosParaArbol(data);
  const [focusedNode, setFocusedNode] = useState(null);

  // Configuración del Tooltip para mostrar información adicional
  const renderTooltip = (model) => {
    const { name, attributes } = model.nodeData;
    return (
      <div>
        <p>{`Nombre: ${name}`}</p>
        <p>{`MMSPath: ${attributes.mmspath}`}</p>
        {/* Agrega más información aquí según tus necesidades */}
      </div>
    );
  };

  // Configuración para ampliar el nodo al acercar el mouse
  const renderCustomNodeElement = ({ nodeDatum, toggleNode }) => (
    <g
      onClick={() => toggleNode(nodeDatum)}
      onMouseEnter={() => setFocusedNode(nodeDatum)}
      onMouseLeave={() => setFocusedNode(null)}
    >
      <circle r={focusedNode === nodeDatum ? 15 : 50} fill="steelblue" />
      <text
        x="0"
        y="0"
        textAnchor="middle"
        dy=".3em"
        fill={focusedNode === nodeDatum ? 'white' : 'black'}
      >
        {nodeDatum.name.split('\n').map((line, index) => (
        <tspan key={index} x="0" dy="1.2em">
          {line}
        </tspan>
      ))}
      </text>
    </g>
  );

  return (
    <div style={treeContainerStyle}>
      <Tree
        data={datosParaArbol}
        translate={{ x: 50, y: 300 }}
        orientation="horizontal"
        pathFunc="straight"
        renderCustomNodeElement={renderCustomNodeElement}
        renderCustomTooltip={renderTooltip}
        nodeSvgShape={{
          shapeProps: {
            stroke: 'black',
          },
        }}
        separation={{ siblings: 1.5, nonSiblings: 2 }} // Ajusta el espaciado entre nodos
        initialDepth={1}
      />
    </div>
  );
};

TreeComponent.propTypes = {
  data: PropTypes.array.isRequired,
};

export default TreeComponent;
