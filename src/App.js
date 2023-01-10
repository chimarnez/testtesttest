import React, { useRef, useState, useEffect } from "react";
import Moveable from "react-moveable";

const sizeValues = ["cover", "contain", "auto"];
function getSizeValue() {
  return sizeValues[Math.floor(Math.random() * sizeValues.length)];
}

const App = () => {
  const [moveableComponents, setMoveableComponents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [moveableId, setMoveableId] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const parentRef = useRef(null);

  const addMoveable = () => {
    if (isLoading) return;
    setIsLoading(true);
    // Create a new moveable component and add it to the array
    fetch(`https://jsonplaceholder.typicode.com/photos?id=${moveableId}`)
      .then((response) => response.json())
      .then((obj) => {
        setMoveableComponents([
          ...moveableComponents,
          {
            id: moveableId,
            top: 0,
            left: 0,
            width: 100,
            height: 100,
            imageUrl: obj[0].url,
            updateEnd: true,
            backgroundSize: getSizeValue(),
          },
        ]);
        setMoveableId(moveableId + 1);
        setIsLoading(false);
      });
  };

  const updateMoveable = (id, newComponent, updateEnd = false) => {
    const { width, height } = parentRef.current.getBoundingClientRect();
    const updatedMoveables = moveableComponents.map((moveable, i) => {
      if (moveable.id === id) {
        newComponent.top = Math.max(newComponent.top, 0);
        newComponent.top = Math.min(
          newComponent.top,
          height - newComponent.height
        );
        newComponent.left = Math.max(newComponent.left, 0);
        newComponent.left = Math.min(
          newComponent.left,
          width - newComponent.width
        );
        return { ...moveable, id, ...newComponent, updateEnd };
      }
      return moveable;
    });
    setMoveableComponents(updatedMoveables);
  };

  const handleResizeStart = (index, e) => {
    console.log("e", e.direction);
    // Check if the resize is coming from the left handle
    const [handlePosX, handlePosY] = e.direction;
    // 0 => center
    // -1 => top or left
    // 1 => bottom or right

    // -1, -1
    // -1, 0
    // -1, 1
    if (handlePosX === -1) {
      console.log("width", moveableComponents, e);
      // Save the initial left and width values of the moveable component
      const initialLeft = e.left;
      const initialWidth = e.width;

      // Set up the onResize event handler to update the left value based on the change in width
    }
  };

  return (
    <main style={{ height: "100vh", width: "100vw" }}>
      <button className="addButton" onClick={addMoveable} disabled={isLoading}>
        Add Moveable1
      </button>
      <div
        id="parent"
        ref={parentRef}
        style={{
          position: "relative",
          background: "black",
          height: "80vh",
          width: "80vw",
        }}
      >
        {moveableComponents.map((item, index) => (
          <Component
            {...item}
            key={index}
            updateMoveable={updateMoveable}
            handleResizeStart={handleResizeStart}
            setSelected={setSelected}
            onDelete={() =>
              setMoveableComponents(
                moveableComponents.filter((it) => it.id !== item.id)
              )
            }
            isSelected={selected === item.id}
          />
        ))}
      </div>
    </main>
  );
};

export default App;

const Component = ({
  updateMoveable,
  top,
  left,
  width,
  height,
  index,
  imageUrl,
  id,
  setSelected,
  isSelected = false,
  onDelete,
  updateEnd,
  backgroundSize,
}) => {
  const ref = useRef();

  const [nodoReferencia, setNodoReferencia] = useState({
    top,
    left,
    width,
    height,
    index,
    imageUrl,
    id,
  });

  let parent = document.getElementById("parent");
  let parentBounds = parent?.getBoundingClientRect();

  const onResize = async (e) => {
    // ACTUALIZAR ALTO Y ANCHO
    const beforeTranslate = e.drag.beforeTranslate;

    let newWidth = e.width;
    let newHeight = e.height;
    const positionMaxTop = top + newHeight;
    const positionMaxLeft = left + newWidth;

    if (positionMaxTop > parentBounds?.height)
      newHeight = parentBounds?.height - top;
    if (positionMaxLeft > parentBounds?.width)
      newWidth = parentBounds?.width - left;
    if (top + beforeTranslate[1] >= 0 && left + beforeTranslate[0] >= 0)
      updateMoveable(id, {
        top,
        left,
        width: newWidth,
        height: newHeight,
        imageUrl,
      });

    // ACTUALIZAR NODO REFERENCIA

    let translateX = beforeTranslate[0];
    let translateY = beforeTranslate[1];

    const updatedTop = Math.max(top + translateY, 0);
    const updatedLeft = Math.max(left + translateX, 0);

    if (left + translateX >= 0) {
      const updatedWidth = Math.min(parentBounds.width - updatedLeft, e.width);
      ref.current.style.width = `${updatedWidth}px`;
    }
    if (top + translateY >= 0) {
      console.log(top + translateY);
      const updatedHeight = Math.min(
        parentBounds.height - updatedTop,
        e.height
      );
      ref.current.style.height = `${updatedHeight}px`;
    }

    ref.current.style.left = `${updatedLeft}px`;
    ref.current.style.top = `${updatedTop}px`;

    setNodoReferencia({
      ...nodoReferencia,
      translateX,
      translateY,
      top: top + translateY < 0 ? 0 : top + translateY,
      left: left + translateX < 0 ? 0 : left + translateX,
    });
  };

  const onResizeEnd = async (e) => {
    let newWidth = e.lastEvent?.width;
    let newHeight = e.lastEvent?.height;

    const positionMaxTop = top + newHeight;
    const positionMaxLeft = left + newWidth;

    if (positionMaxTop > parentBounds?.height)
      newHeight = parentBounds?.height - top;
    if (positionMaxLeft > parentBounds?.width)
      newWidth = parentBounds?.width - left;

    const { lastEvent } = e;
    const { drag } = lastEvent;
    const { beforeTranslate } = drag;

    const absoluteTop = top + beforeTranslate[1];
    const absoluteLeft = left + beforeTranslate[0];
    // ref.current.style.transform = "";

    updateMoveable(
      id,
      {
        top: absoluteTop,
        left: absoluteLeft,
        width: newWidth,
        height: newHeight,
        imageUrl,
      },
      true
    );
  };

  return (
    <>
      <div
        ref={ref}
        className="draggable"
        id={"component-" + id}
        style={{
          position: "absolute",
          top: top,
          left: left,
          width: width,
          height: height,
          overflow: "hidden",
          backgroundSize,
          backgroundPosition: "center",
          backgroundImage: `url(${imageUrl})`,
        }}
        onClick={() => setSelected(id)}
      >
        <button
          className="removeButton"
          hidden={!isSelected}
          onClick={onDelete}
        >
          Delete
        </button>
      </div>
      <Moveable
        target={isSelected && ref.current}
        resizable
        draggable
        onDrag={(e) => {
          updateMoveable(id, {
            top: e.top,
            left: e.left,
            width,
            height,
            imageUrl,
          });
        }}
        onResize={onResize}
        // onResize={({ width, height, delta, direction }) => {
        //   console.log(width, height, delta, direction);
        // }}
        onResizeEnd={onResizeEnd}
        keepRatio={false}
        throttleResize={1}
        renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
        edge={false}
        zoom={1}
        origin={false}
        padding={{ left: 0, top: 0, right: 0, bottom: 0 }}
      />
    </>
  );
};
