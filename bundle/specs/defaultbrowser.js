var t={script:["defaultbrowser"],postProcess:function(e){return e.split(`
`).map(r=>r.startsWith("*")?{}:{name:r.trim()})}},s={name:"defaultbrowser",description:"Change your default browser from the CLI",args:{isOptional:!0,generators:t}},n=s;export{n as default};
