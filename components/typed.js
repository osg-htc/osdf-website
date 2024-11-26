import Typed from "typed.js";
import { useRef, useEffect } from "react";

export default function TypedArea() {

  // Create reference to store the DOM element containing the animation
  const el = useRef(null);
  // Create reference to store the Typed instance itself
  const typed = useRef(null);

  useEffect(() => {
    const options = {
      strings: [
        `<span class='text-green-600'>$</span> <span class='text-blue-600'>pelican object get</span> pelican://osg-htc.org/public/data ./<br/>
        query1 done!`,
      ],
      typeSpeed: 20,
      backSpeed: 50,
    };

    // elRef refers to the <span> rendered below
    typed.current = new Typed(el.current, options);

    return () => {
      // Make sure to destroy Typed instance during cleanup
      // to prevent memory leaks
      typed.current.destroy();
    }
  }, [])


  return (
    <>
      <div className="typed-container w-full text-sm lg:text-inherit">
        <div className="bg-gray-300 py-1 rounded-t-md text-center text-black shadow font-bold border-b border-gray-400">
          Terminal
          </div>
        <div className="bg-white p-3 rounded-b-md h-40">
          <span className="typed-text text-black font-mono" ref={el} />
        </div>
      </div>
    </>
  )
}