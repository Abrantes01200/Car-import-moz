// Extrair preço do backend
document.getElementById('extrairPrecoBtn').addEventListener('click', async ()=>{
    const link = document.getElementById('linkVeiculo').value.trim();
    if(!link) return alert('Cole o link do veículo!');
    try{
        const res = await fetch('http://localhost:3000/extrair-preco',{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({link})
        });
        const data = await res.json();
        if(data.preco){
            document.getElementById('valor').value = data.preco;
            alert('Preço extraído: '+data.preco+' USD');
        } else {
            alert(data.erro || 'Não foi possível extrair o preço');
        }
    } catch(err){
        console.error(err);
        alert('Erro ao conectar ao servidor. Insira o preço manualmente.');
    }
});

// Função de cálculo (igual a versão anterior)
function formatVal(v, moeda){
    if(typeof v!=='number'||!isFinite(v)) return '-';
    return new Intl.NumberFormat('pt-MZ',{minimumFractionDigits:2,maximumFractionDigits:2}).format(v)+' '+moeda;
}

function calcular(){
    const resultadoDiv=document.getElementById('resultado');
    resultadoDiv.innerHTML='';

    const valor=parseFloat(document.getElementById('valor').value);
    const tipo=document.getElementById('tipo').value;
    const cilindradaSel=document.getElementById('cilindrada').value;
    const moeda=document.getElementById('moeda').value||'USD';
    const icePercent=parseFloat(document.getElementById('ice').value)/100||0;

    if(!valor||isNaN(valor)||valor<=0){
        resultadoDiv.innerHTML='<div style="color:#c62828;font-weight:700;">Por favor insira um Valor CIF válido (>0).</div>';
        return;
    }

    let dutyRate=0;
    if(tipo==='pickup') dutyRate=0.20;
    else if(tipo==='minibus') dutyRate=0;
    else{
        if(cilindradaSel==='<=1500') dutyRate=0.25;
        else if(cilindradaSel==='1501-3000') dutyRate=0.40;
        else if(cilindradaSel==='>3000') dutyRate=0.50;
        else dutyRate=0.40;
    }

    const impostoAduaneiro=valor*dutyRate;
    const impostoConsumo=(valor+impostoAduaneiro)*icePercent;
    const ivaRate=0.17;
    const baseIva=valor+impostoAduaneiro+impostoConsumo;
    const iva=baseIva*ivaRate;
    const taxaExtra50k=(valor>50000)?(valor*0.0085):0;
    const total=valor+impostoAduaneiro+impostoConsumo+iva+taxaExtra50k;

    const out=[];
    out.push('<h3>Resultado da Simulação</h3>');
    out.push('<div><strong>Valor CIF:</strong> '+formatVal(valor,moeda)+'</div>');
    out.push('<div><strong>Direitos Aduaneiros ('+(dutyRate*100).toFixed(0)+'%):</strong> '+formatVal(impostoAduaneiro,moeda)+'</div>');
    out.push('<div><strong>ICE ('+(icePercent*100).toFixed(2)+'%):</strong> '+formatVal(impostoConsumo,moeda)+'</div>');
    out.push('<div><strong>Base IVA:</strong> '+formatVal(baseIva,moeda)+'</div>');
    out.push('<div><strong>IVA (17%):</strong> '+formatVal(iva,moeda)+'</div>');
    if(taxaExtra50k) out.push('<div><strong>Taxa adicional (CIF > 50.000):</strong> '+formatVal(taxaExtra50k,moeda)+'</div>');
    out.push('<hr><div style="font-size:18px;margin-top:6px;"><strong>Total Estimado: '+formatVal(total,moeda)+'</strong></div>');
    out.push('<div style="margin-top:8px;font-size:12px;color:#5b6b85;">Nota: Valores são estimativas — confirme com Autoridade Tributária ou despachante.</div>');
    resultadoDiv.innerHTML=out.join('');
    resultadoDiv.scrollIntoView({behavior:'smooth', block:'nearest'});
}

// Abas
document.addEventListener('DOMContentLoaded',function(){
    document.getElementById('calcBtn').addEventListener('click',calcular);
    const tabBtns=document.querySelectorAll('.tab-btn');
    const tabs=document.querySelectorAll('.tab');
    tabBtns.forEach(btn=>{
        btn.addEventListener('click',()=>{
            tabBtns.forEach(b=>b.classList.remove('active'));
            btn.classList.add('active');
            const target=btn.dataset.tab;
            tabs.forEach(t=>{
                if(t.id===target) t.classList.add('active');
                else t.classList.remove('active');
            });
        });
    });
});
