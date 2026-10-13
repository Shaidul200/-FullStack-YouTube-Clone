import React, { useId } from 'react'

const Input = React.forwardRef( function Input({label, type= "text",
     className = "",...props
}, ref
    
){
    const id =useId()
    return(
         <div>
            {label && (
                <label
                className='inline-block mb-1 pl-1'
                htmlFor={id}
                >
                    {label}
                </label>
            )}
            <input
                type={type}
                className={`${className ? `${className} ` : ""}w-full rounded-md border border-gray-700 bg-transparent px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 max-sm:py-1.5 max-sm:px-2 max-sm:text-xs`}
                ref={ref}
                {...props}
                id={id}
            /> 
         </div>
        
    )
}

)

export default Input