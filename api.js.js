function searchPhone(p) {
    let c = p.replace(/[^0-9+]/g,'');
    if(!c.startsWith('+')) c='+'+c;
    return new Promise(r=>{
        fetch(`https://api.veriphone.com/v1/verify?phone=${encodeURIComponent(c)}`)
        .then(x=>x.json())
        .then(d=>{
            let res={type:'phone',query:c,found:false,data:{},links:[]};
            if(d.status==='success'&&d.valid){
                res.found=true;
                res.data={country:d.country_name||'—',carrier:d.carrier||'—',region:d.location||'—',lineType:d.line_type||'—',international:d.international_format||'—',local:d.local_format||'—'};
            }
            res.links=[
                {name:'Telegram',url:`https://t.me/${c.replace('+','')}`},
                {name:'WhatsApp',url:`https://wa.me/${c.replace('+','').replace(/ /g,'')}`},
                {name:'Truecaller',url:`https://www.truecaller.com/search/${c}`},
                {name:'LeakCheck',url:`https://leakcheck.net/search?query=${encodeURIComponent(c)}`},
                {name:'VK',url:`https://vk.com/search?c[phone]=${c}`}
            ];
            r(res);
        })
        .catch(()=>{
            r({
                type:'phone',query:c,found:false,data:{},links:[
                    {name:'Truecaller',url:`https://www.truecaller.com/search/${c}`},
                    {name:'LeakCheck',url:`https://leakcheck.net/search?query=${encodeURIComponent(c)}`},
                    {name:'Telegram',url:`https://t.me/${c.replace('+','')}`},
                    {name:'WhatsApp',url:`https://wa.me/${c.replace('+','').replace(/ /g,'')}`},
                    {name:'VK',url:`https://vk.com/search?c[phone]=${c}`}
                ]
            });
        });
    });
}

function searchNick(n) {
    return new Promise(r=>{
        fetch(`https://whatsmyname.app/api/v1/username/${n}`)
        .then(x=>x.json())
        .then(d=>{
            let res={type:'nick',query:n,found:false,profiles:[],links:[]};
            if(d&&d.sites){
                for(let s of d.sites){
                    if(s.status==='claimed'){
                        res.found=true;
                        res.profiles.push({name:s.name,url:s.url});
                    }
                }
            }
            let fallback=[
                ['Instagram',`https://instagram.com/${n}`],
                ['VK',`https://vk.com/${n}`],
                ['GitHub',`https://github.com/${n}`],
                ['TikTok',`https://tiktok.com/@${n}`],
                ['Twitter',`https://twitter.com/${n}`],
                ['YouTube',`https://youtube.com/@${n}`],
                ['Reddit',`https://reddit.com/user/${n}`],
                ['Twitch',`https://twitch.tv/${n}`],
                ['Pinterest',`https://pinterest.com/${n}`],
                ['Steam',`https://steamcommunity.com/id/${n}`],
                ['Telegram',`https://t.me/${n}`]
            ];
            res.links=fallback.map(([name,url])=>({name,url}));
            r(res);
        })
        .catch(()=>{
            let fallback=[
                ['Instagram',`https://instagram.com/${n}`],
                ['VK',`https://vk.com/${n}`],
                ['GitHub',`https://github.com/${n}`],
                ['TikTok',`https://tiktok.com/@${n}`],
                ['Twitter',`https://twitter.com/${n}`],
                ['YouTube',`https://youtube.com/@${n}`],
                ['Reddit',`https://reddit.com/user/${n}`],
                ['Twitch',`https://twitch.tv/${n}`],
                ['Pinterest',`https://pinterest.com/${n}`],
                ['Steam',`https://steamcommunity.com/id/${n}`],
                ['Telegram',`https://t.me/${n}`]
            ];
            r({type:'nick',query:n,found:false,profiles:[],links:fallback.map(([name,url])=>({name,url}))});
        });
    });
}

function searchName(n) {
    return Promise.resolve({
        type:'name',
        query:n,
        found:true,
        links:[
            {name:'Google',url:`https://www.google.com/search?q=${encodeURIComponent(n)}`},
            {name:'Яндекс',url:`https://yandex.ru/search/?text=${encodeURIComponent(n)}`},
            {name:'VK',url:`https://vk.com/search?c[0]=people&c[q]=${encodeURIComponent(n)}`},
            {name:'Facebook',url:`https://www.facebook.com/search/top/?q=${encodeURIComponent(n)}`},
            {name:'Одноклассники',url:`https://www.ok.ru/search?q=${encodeURIComponent(n)}`},
            {name:'LinkedIn',url:`https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(n)}`}
        ]
    });
}

function search(q,m){
    if(m==='phone')return searchPhone(q);
    if(m==='nick')return searchNick(q);
    if(m==='name')return searchName(q);
    return Promise.reject('unknown');
}

function formatResult(d){
    let h='';
    if(d.type==='phone'){
        h+=`📱 <b>Номер:</b> ${d.query}\n`;
        if(d.found&&d.data){
            h+=`🌍 <b>Страна:</b> ${d.data.country}\n`;
            h+=`📞 <b>Оператор:</b> ${d.data.carrier}\n`;
            h+=`📍 <b>Регион:</b> ${d.data.region}\n`;
            h+=`📌 <b>Тип:</b> ${d.data.lineType}\n`;
            h+=`🔢 <b>Международный:</b> ${d.data.international}\n`;
            h+=`📎 <b>Локальный:</b> ${d.data.local}\n`;
        }else h+=`❌ <span class="err">Информация не найдена</span>\n`;
        h+=`\n${'─'.repeat(40)}\n🔎 <b>Проверка:</b>\n`;
        for(let l of d.links)h+=`→ <a href="${l.url}" target="_blank">${l.name}</a>\n`;
    }
    else if(d.type==='nick'){
        h+=`👤 <b>Ник:</b> ${d.query}\n\n`;
        if(d.found&&d.profiles.length){
            h+=`✅ <b>Найденные профили:</b>\n`;
            for(let p of d.profiles)h+=`→ <a href="${p.url}" target="_blank">${p.name}</a>\n`;
        }else h+=`❌ <span class="err">Профили не найдены</span>\n`;
        h+=`\n${'─'.repeat(40)}\n🔍 <b>Проверь вручную:</b>\n`;
        for(let l of d.links)h+=`→ <a href="${l.url}" target="_blank">${l.name}</a>\n`;
    }
    else if(d.type==='name'){
        h+=`📛 <b>ФИО:</b> ${d.query}\n\n🔍 <b>Поиск:</b>\n`;
        for(let l of d.links)h+=`→ <a href="${l.url}" target="_blank">${l.name}</a>\n`;
    }
    return h;
}