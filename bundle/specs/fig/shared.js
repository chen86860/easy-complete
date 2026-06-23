var u=async({exec:n,query:e})=>{let{stdout:t}=await n({command:"fig",args:["_","request","--route","/graphql","--method","--body",JSON.stringify({query:e})]});return JSON.parse(t).data},h={script:["fig","settings","autocomplete.disableForCommands"],postProcess:n=>{let e=n.split(`
`).filter(r=>r.length>0);return[{name:"Disable new CLI...",description:`You must pass a valid JSON array of CLI tools contained within single quotes. e.g. '["npm","cd","ls"]'`,icon:"fig://icon?type=box",insertValue:JSON.stringify(e.concat(["{cursor}"]))},{name:"Enable all commands",icon:"fig://icon?type=box",insertValue:"'[]'"}].concat(e.map(r=>({name:`Enable ${r}`,icon:"fig://icon?type=box",insertValue:JSON.stringify(e.filter(i=>i!=r))})))}},S={script:["fig","theme","--list"],postProcess:n=>{let e=[{name:"system",icon:"\u{1F4BB}",priority:51},{name:"light",icon:"fig://template?color=ffffff&badge=\u2600\uFE0F",priority:51},{name:"dark",icon:"fig://template?color=000000&badge=\u{1F319}",priority:51}];return n.split(`
`).map(t=>({name:t.replace(".json",""),icon:"\u{1F3A8}"})).concat(e)}},b={"autocomplete.disableForCommands":h,"autocomplete.theme":S},F={custom:async()=>["figterm","fig_cli","fig_desktop","daemon"].map(n=>({name:n}))},C=async(n,e)=>{let{stdout:t}=await e({command:"fig",args:["_","request","--method","GET","--route","/settings/all"]}),{settings:a,actions:r}=JSON.parse(t),i=r.map(s=>({name:s.identifier.startsWith("autocomplete.")?s.identifier.slice(13):s.identifier,description:s.description,icon:"\u26A1\uFE0F"}));return{name:"settings",subcommands:a.map(({settingName:s,description:m,type:c,options:o,default:d})=>{let p=c==="boolean"?["true","false"]:s.startsWith("autocomplete.keybindings.")?i:o?.map(g=>({name:g.name||g,description:g.description||""})),l=b[s];return{name:s,description:m,icon:"fig://icon?type=commandkey",args:{name:c,default:d,suggestions:l?[]:p,generators:l}}})}},x={script:["fig","internal","local-state","all","--format","json"],postProcess:n=>{let e=JSON.parse(n);return Object.keys(e).map(t=>({name:t,description:JSON.stringify(e[t])}))}},N=n=>({cache:{strategy:"stale-while-revalidate"},custom:async(e,t)=>{let a=n.installed?["plugins","list","--format","json","--installed"]:["plugins","list","--format","json"],{stdout:r}=await t({command:"fig",args:a});return JSON.parse(r).map(s=>({name:s.name,icon:s.icon?.startsWith("https://")?"\u{1F4E6}":s.icon,description:s.description}))}}),G={cache:{strategy:"stale-while-revalidate"},custom:async(n,e)=>{let t=n.findIndex(i=>i.startsWith("--team"));if(t===-1)return[];let a;return n[t].includes("=")?a=n[t+1].split("=")[1]:a=n[t+1],JSON.parse((await e({command:"fig",args:["user","tokens","list","--team",a,"--format","json"]})).stdout).map(i=>({name:i.name,description:`Team: ${i.namespace.username}.${i.description?" "+i.description:""}`}))}},O={cache:{strategy:"stale-while-revalidate"},script:["fig","team","--list","--format","json"],postProcess:n=>JSON.parse(n).map(e=>({name:e.name,priority:75}))},T={cache:{strategy:"stale-while-revalidate",ttl:1e3*60},custom:async(n,e)=>{let t=n.at(-3);return JSON.parse((await e({command:"fig",args:["team","--format","json",t,"members"]})).stdout).map(r=>({name:r.email,description:`Role: ${r.role}`}))}},w={cache:{strategy:"stale-while-revalidate",ttl:1e3*60},custom:async(n,e)=>{let t=n.at(-3);return JSON.parse((await e({command:"fig",args:["team","--format","json",t,"invitations"]})).stdout).map(r=>({name:r.email,description:`Role: ${r.role}`}))}},f=`fragment ScriptFields on Script {
  name
  fields {
    icon
    displayName
    description
    templateVersion
    tags
    parameters {
      type
      name
      displayName
      description
      text {
        placeholder
      }
      checkbox {
        trueValueSubstitution
        falseValueSubstitution
      }
      selector {
        generators {
          named {
            name
          }
          shellScript {
            script
          }
          type
        }
        placeholder
        suggestions
      }
      path {
        extensions
        fileType
      }
    }
    runtime
  }
  relevanceScore
  lastInvokedAt
  lastInvokedAtByUser
  isOwnedByCurrentUser
}`,y=n=>{let e=[{name:["-h","--help"],description:"Show help for the script"}];for(let t of n.fields.parameters){let a={name:`--${t.name}`,description:t?.description??t?.type,isRequired:!0};switch(t.type){case"Text":a.args={name:t.name};break;case"Selector":let r=[];t?.selector?.generators&&(r=t?.selector?.generators.filter(i=>i.type==="ShellScript").map(i=>({script:["bash","-c",i?.shellScript?.script],splitOn:`
`}))),a.args={name:t.name,suggestions:t?.selector?.suggestions,generators:r};break;case"Path":a.args={name:t.name,template:"filepaths"};break;case"Checkbox":e.push({...a,name:`--no-${t.name}`,exclusiveOn:[`--${t.name}`]}),a.exclusiveOn=[`--no-${t.name}`];break}e.push(a)}return e},$=async(n,e)=>{let t=`query Scripts {
    currentUser {
      namespace {
        username
        scripts {
          ...ScriptFields
        }
      }
      teamMemberships {
        team {
          namespace {
            username
            scripts {
              ...ScriptFields
            }
          }
        }
      }
    }
  }

  ${f}`,a=await u({exec:e,query:t});return{name:"run",subcommands:[...a.currentUser.namespace.scripts.map(s=>({...s,namespace:a.currentUser.namespace.username})),...a.currentUser.teamMemberships.flatMap(s=>s.team.namespace.scripts.map(m=>({...m,namespace:s.team.namespace.username})))].map(s=>{let m=`${s.fields.displayName??s.name} | @${s.namespace}`,c=[`@${s.namespace}/${s.name}`];s?.isOwnedByCurrentUser&&c.push(s.name);let o=y(s);return{displayName:m,icon:s?.fields?.icon??"\u26A1\uFE0F",name:c,insertValue:s?.isOwnedByCurrentUser?s.name:c[0],description:s?.fields?.description,options:o}}),filterStrategy:"fuzzy"}},I=async(n,e)=>{let t=`query CommandLineTool {
      currentUser {
        namespace {
          username
          commandlineTools {
            ...CommandlineToolFields
          }
        }
        teamMemberships {
          team {
            namespace {
              username
              commandlineTools {
                ...CommandlineToolFields
              }
            }
          }
        }
      }
    }
    
    fragment CommandlineToolFields on CommandlineTool {
      root {
        ...CLICommandFields
      }
      flattenedCommands {
        ...CLICommandFields
      }
    }
    
    fragment CLICommandFields on ICLICommand {
      uuid
      name
      description
      ... on NestedCommand {
        subcommands {
          uuid
        }
      }
      ... on ScriptCommand {
        script {
          ...ScriptFields
        }
      }
    }
    
    ${f}`,a=await u({exec:e,query:t});return{name:"cli",subcommands:[...a.currentUser.namespace.commandlineTools.map(s=>({...s,namespace:a.currentUser.namespace.username})),...a.currentUser.teamMemberships.flatMap(s=>s.team.namespace.commandlineTools.map(m=>({...m,namespace:s.team.namespace.username})))].map(s=>{let m={};for(let o of s.flattenedCommands)m[o.uuid]=o;let c=(o,d)=>{if("subcommands"in o){let p=[];for(let l of o.subcommands)p.push(c(m[l.uuid],d+1));return{name:d===0?`@${s.namespace}/${o.name}`:o.name,description:o.description,subcommands:p,options:[{name:["-h","--help"],description:"Print help information"}]}}else{let p=o.script,l=y(p);return{icon:p?.fields?.icon,name:o.name,description:o.description,options:l}}};return c(s.root,0)})}},v={script:["fig","_","request","--method","GET","--route","/access/hosts/all"],cache:{strategy:"stale-while-revalidate"},postProcess:n=>JSON.parse(n).map(e=>({insertValue:`@${e.namespace}/${e.nickName}`,displayName:`${e.nickName} (@${e.namespace})`,name:`@${e.namespace}/${e.nickName}`,description:e.description}))},U={custom:async(n,e)=>{let t=n.slice(2).find(r=>!r.startsWith("-"));return t===void 0?[]:JSON.parse((await e({command:"fig",args:["ssh",t,"--get-identities"]})).stdout).map(r=>({name:r.displayName}))}},k={script:["fig","user","list-accounts"],postProcess:n=>n.startsWith("error: ")?[]:n.trim().split(`
`).map(e=>({name:e,icon:"\u{1F464}"}))},J={};export{b as SETTINGS_GENERATOR,I as commandLineToolSpecGenerator,J as default,w as invitationsGenerators,T as membersGenerators,N as pluginsGenerator,$ as scriptsSpecGenerator,C as settingsSpecGenerator,v as sshHostsGenerator,U as sshIdentityGenerator,x as stateGenerator,F as subsystemsGenerator,O as teamsGenerators,S as themesGenerator,G as tokensGenerators,k as userGenerator};
