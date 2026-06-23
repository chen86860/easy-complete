var i={script:["env"],postProcess:n=>n.length===0?[]:n.split(`
`).map(e=>e.split("=")[0]).map(e=>({name:`${e}`,type:"arg",description:"Environment Variable"}))},t={name:"unset",description:"Named variable shall be undefined",args:{name:"string",generators:i},options:[{name:"-v",description:"Variable definition will be unset"}]},a=t;export{a as default};
