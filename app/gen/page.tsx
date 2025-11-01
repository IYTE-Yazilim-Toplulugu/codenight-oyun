"use client"

import {useState} from "react";
import {configurate, generateImage} from "@/lib/fal";
import Image from "next/image";

export default function GenPage(){
    const [state, setState] = useState("Waiting for prompt.");
    const [image, setImage] = useState<string | null>(null);

    return (
      <div>
          <h1>{state}</h1>
          {image && (
              <Image src={image} alt="" fill={true} />
          )}
          <input id={"prompt"} placeholder={"Hint"}  />
          <button onClick={async ()=>{
              const promptInput = document.getElementById("prompt");
              if (promptInput === null || !(promptInput instanceof HTMLInputElement) || !promptInput.value)
                  return;



              configurate("402247af-0758-43df-9fc2-23b411ebb456:e5ec694be5827a582b6eee8c69b7ffd5");

              try {
                  const result = await generateImage(promptInput.value, (x) => {
                      console.log(x.response_url);
                      setState(x.status);
                  });

                  setImage(result ? result : null);
              }
              catch (error){
                  console.log(error);
              }

          }}>Submit</button>
      </div>
    );
}