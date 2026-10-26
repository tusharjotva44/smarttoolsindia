(() => {
  "use strict";
  const $ = (s, root=document) => root.querySelector(s);
  const modal = $("#toolModal"), modalTitle=$("#modalTitle"), modalKicker=$("#modalKicker"), modalContent=$("#modalContent"), toastEl=$("#toast");
  $("#year").textContent = new Date().getFullYear();
  let toastTimer;
  function toast(message){toastEl.textContent=message;toastEl.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>toastEl.classList.remove("show"),2800)}
  function safeNum(v){const n=Number(v);return Number.isFinite(n)?n:null}
  function fmt(n,d=2){return Number(n).toLocaleString("en-IN",{maximumFractionDigits:d})}
  function field(label,id,type="number",value="",extra=""){return '<div class="field"><label for="'+id+'">'+label+'</label><input id="'+id+'" type="'+type+'" value="'+value+'" '+extra+'></div>'}
  function selectField(label,id,options){return '<div class="field"><label for="'+id+'">'+label+'</label><select id="'+id+'">'+options.map(o=>'<option value="'+o[0]+'">'+o[1]+'</option>').join("")+'</select></div>'}
  function panel(label,value,note=""){return '<div class="result-panel"><div class="result-label">'+label+'</div><div class="result-value">'+value+'</div>'+(note?'<div class="result-note">'+note+'</div>':"")+'</div>'}
  function openTool(name){const tools={image:renderImage,pdf:renderPdf,age:renderAge,percentage:renderPercentage,emi:renderEmi,words:renderWords,qr:renderQr,units:renderUnits,gst:renderGst,invoice:renderInvoice};if(!tools[name])return;modalContent.innerHTML="";modalTitle.textContent=({image:"Image Tools",pdf:"PDF Tools",age:"Age Calculator",percentage:"Percentage Calculator",emi:"EMI Calculator",words:"Word Counter",qr:"QR Code Generator",units:"Unit Converter",gst:"GST Calculator",invoice:"Invoice Generator"})[name];modalKicker.textContent="SMARTTOOLS INDIA / "+name.toUpperCase();modal.classList.add("open");modal.setAttribute("aria-hidden","false");document.body.style.overflow="hidden";tools[name]();$("#closeModal").focus()}
  function closeTool(){modal.classList.remove("open");modal.setAttribute("aria-hidden","true");document.body.style.overflow="";modalContent.innerHTML=""}
  document.querySelectorAll("[data-tool]").forEach(b=>b.addEventListener("click",()=>openTool(b.dataset.tool)));
  $("#closeModal").addEventListener("click",closeTool);modal.addEventListener("click",e=>{if(e.target===modal)closeTool()});document.addEventListener("keydown",e=>{if(e.key==="Escape"&&modal.classList.contains("open"))closeTool()});

  function renderAge(){
    modalContent.innerHTML='<div class="field-grid">'+field("Date of birth","birthDate","date","","required")+field("Calculate age on","asOfDate","date",localDate())+'</div><button class="tool-btn" id="calcAge">Calculate age ↗</button><div id="ageResult"></div><p class="hint">Choose a birth date and the date you want to calculate the age on.</p>';
    $("#asOfDate").value=localDate();
    $("#calcAge").onclick=()=>{const b=$("#birthDate").value,a=$("#asOfDate").value,out=$("#ageResult");if(!b){toast("Please choose your date of birth.");return}const birth=parseDate(b),asof=parseDate(a);if(!birth||!asof||birth>asof){out.innerHTML=panel("Check your dates","Invalid date","The calculation date must be on or after your date of birth.");return}
      let y=asof.getFullYear()-birth.getFullYear(),m=asof.getMonth()-birth.getMonth(),d=asof.getDate()-birth.getDate();if(d<0){m--;d+=daysInMonth(asof.getFullYear(),asof.getMonth()-1)}if(m<0){y--;m+=12}
      const totalDays=Math.floor((Date.UTC(asof.getFullYear(),asof.getMonth(),asof.getDate())-Date.UTC(birth.getFullYear(),birth.getMonth(),birth.getDate()))/86400000);
      out.innerHTML=panel("Your age",y+" years, "+m+" months, "+d+" days")+'<div class="result-grid age-result-grid"><div class="result-chip"><span>Total months</span><b>'+fmt(y*12+m)+'</b></div><div class="result-chip"><span>Total weeks</span><b>'+fmt(Math.floor(totalDays/7))+'</b></div><div class="result-chip"><span>Total days</span><b>'+fmt(totalDays)+'</b></div></div>'};
    ["birthDate","asOfDate"].forEach(id=>$("#"+id).addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();$("#calcAge").click()}}));
    ["birthDate","asOfDate"].forEach(id=>$("#"+id).addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();$("#calcAge").click()}}));
  }
  function localDate(){const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
  function parseDate(s){if(!s)return null;const p=s.split("-").map(Number);if(p.length!==3)return null;const d=new Date(p[0],p[1]-1,p[2]);return d.getFullYear()===p[0]&&d.getMonth()===p[1]-1&&d.getDate()===p[2]?d:null}
  function daysInMonth(y,m){return new Date(y,m+1,0).getDate()}

  function renderPercentage(){
    modalContent.innerHTML=selectField("Calculation","pctMode",[["simple","Simple percentage: What is X% of Y?"],["of","What is X% of Y?"],["is","X is what percent of Y?"],["change","Percentage change from X to Y"],["discount","Discount: price after X% off"]])+'<div class="field-grid">'+field("X / Percentage","pctX","number","10",'step="any"')+field("Y / Value","pctY","number","500",'step="any"')+'</div><button class="tool-btn" id="calcPct">Calculate ↗</button><div id="pctResult"></div>';
    $("#calcPct").onclick=()=>{const x=safeNum($("#pctX").value),y=safeNum($("#pctY").value),mode=$("#pctMode").value;if(x===null||y===null){toast("Enter both numbers first.");return}let v,label,note="";if(mode==="of"||mode==="simple"){v=x/100*y;label=fmt(x)+"% of "+fmt(y)}else if(mode==="is"){if(y===0){toast("Y cannot be zero for this calculation.");return}v=x/y*100;label=fmt(x)+" is "+fmt(v)+"% of "+fmt(y)}else if(mode==="change"){if(x===0){toast("Starting value cannot be zero.");return}v=(y-x)/Math.abs(x)*100;label="Percentage change";note=(v>0?"Increase: ":v<0?"Decrease: ":"No change: ")+fmt(Math.abs(v))+"%"}else{v=y-(y*x/100);label="Price after discount";note="You save "+fmt(y*x/100)}$("#pctResult").innerHTML=panel(label,fmt(v)+(mode==="is"||mode==="change"?"%":""),note)};
    $("#pctMode").onchange=()=>{const m=$("#pctMode").value;$("#pctX").previousElementSibling.textContent=m==="of"?"Percentage / X":m==="simple"?"Percentage (X)":m==="discount"?"Discount percentage / X":m==="is"?"Value / X":"Starting value / X";$("#pctY").previousElementSibling.textContent=m==="change"?"Ending value / Y":m==="discount"?"Original price / Y":m==="simple"?"Value (Y)":"Value / Y";if(m==="simple"){$("#pctX").value="10";$("#pctY").value="500"}};
  }
  function renderEmi(){
    modalContent.innerHTML='<div class="field-grid">'+field("Loan amount (₹)","loanAmount","number","500000",'min="0" step="any"')+field("Annual interest rate (%)","loanRate","number","9",'min="0" step="any"')+field("Loan tenure (years)","loanYears","number","5",'min="0.1" step="any"')+'</div><button class="tool-btn" id="calcEmi">Calculate EMI ↗</button><div id="emiResult"></div><p class="hint">Estimate only. Actual lender payments may include fees, insurance, and other charges.</p>';
    $("#calcEmi").onclick=()=>{const P=safeNum($("#loanAmount").value),annual=safeNum($("#loanRate").value),years=safeNum($("#loanYears").value);if(P===null||annual===null||years===null||P<=0||annual<0||years<=0){toast("Enter a positive loan amount and tenure, with a valid interest rate.");return}const n=Math.round(years*12),r=annual/1200,emi=r===0?P/n:P*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1),total=emi*n,interest=total-P;$("#emiResult").innerHTML=panel("Estimated monthly EMI","₹"+fmt(emi))+'<div class="result-grid emi-result-grid"><div class="result-chip"><span>Principal amount</span><b>₹'+fmt(P)+'</b></div><div class="result-chip"><span>Total interest</span><b>₹'+fmt(interest)+'</b></div><div class="result-chip"><span>Total repayment</span><b>₹'+fmt(total)+'</b></div></div>'};
  }
  function renderGst(){
    modalContent.innerHTML=selectField("GST calculation","gstMode",[["add","Add GST (price before GST)"],["remove","Remove GST (price includes GST)"]])+'<div class="field-grid">'+field("Amount before GST (₹)","gstAmount","number","1000",'min="0" step="any"')+selectField("GST rate","gstRate",[["0","0%"],["0.25","0.25%"],["3","3%"],["5","5%"],["12","12%"],["18","18%"],["28","28%"]])+'</div><button type="button" class="tool-btn" id="calcGst">Calculate GST ↗</button><div id="gstResult" aria-live="polite"></div><p class="hint">Choose the applicable GST rate for your goods or service. This calculator provides an estimate; confirm the correct rate and tax treatment for your transaction.</p>';
    const amountInput=$("#gstAmount"), modeSelect=$("#gstMode"), rateSelect=$("#gstRate"), result=$("#gstResult"), calcButton=$("#calcGst");
    rateSelect.value="18";
    function calculateGst(){
      const amountText=amountInput.value.trim(), amount=safeNum(amountText), rate=safeNum(rateSelect.value), mode=modeSelect.value;
      if(amountText===""||amount===null||amount<0||rate===null){
        result.innerHTML=panel("Check your amount","Enter a valid amount of ₹0 or more.");
        return;
      }
      const taxable=mode==="add"?amount:amount/(1+rate/100);
      const tax=mode==="add"?amount*rate/100:amount-taxable;
      const total=mode==="add"?amount+tax:amount;
      result.innerHTML=panel(mode==="add"?"Total including GST":"Taxable amount before GST","₹"+fmt(total))+'<div class="result-grid"><div class="result-chip"><span>Taxable amount</span><b>₹'+fmt(taxable)+'</b></div><div class="result-chip"><span>GST ('+fmt(rate,2)+'%)</span><b>₹'+fmt(tax)+'</b></div><div class="result-chip"><span>Total amount</span><b>₹'+fmt(total)+'</b></div></div>';
    }
    calcButton.onclick=calculateGst;
    amountInput.addEventListener("input",calculateGst);
    amountInput.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();calculateGst()}});
    modeSelect.addEventListener("change",()=>{amountInput.previousElementSibling.textContent=modeSelect.value==="add"?"Amount before GST (₹)":"Amount including GST (₹)";calculateGst();});
    rateSelect.addEventListener("change",calculateGst);
    calculateGst();
  }

  function renderInvoice(){
    const today=localDate();
    const invoiceNo="INV-"+today.replace(/-/g,"")+"-001";
    modalContent.innerHTML =
      '<p class="hint invoice-intro">Create a clean invoice, calculate GST and discount automatically, then download it as a PDF or print it. Your entries stay in this browser.</p>'+
      '<div class="invoice-section-title">Your business</div>'+
      '<div class="field-grid">'+field("Business / shop name","invBusiness","text","","placeholder=\"e.g. Shree Enterprise\" required")+field("Business phone number","invContact","tel","","placeholder=\"10-digit phone number\" inputmode=\"numeric\" maxlength=\"10\" pattern=\"[0-9]{10}\"")+field("Business address","invAddress","text","","placeholder=\"Address\"")+field("GSTIN (optional)","invGstin","text","","placeholder=\"GST identification number\" maxlength=\"15\"")+'</div>'+
      '<div class="invoice-section-title">Bill to</div>'+
      '<div class="field-grid">'+field("Customer name","invCustomer","text","","placeholder=\"Customer / company name\" required")+field("Customer phone number","invCustomerContact","tel","","placeholder=\"10-digit phone number\" inputmode=\"numeric\" maxlength=\"10\" pattern=\"[0-9]{10}\"")+field("Customer address","invCustomerAddress","text","","placeholder=\"Billing address\"")+field("Invoice number","invNumber","text",invoiceNo,'maxlength="40"')+field("Invoice date","invDate","date",today)+field("Due date","invDue","date",today)+'</div>'+
      '<div class="invoice-section-title">Items / services</div>'+
      '<div class="invoice-items-wrap"><table class="invoice-items-table"><thead><tr><th>Item / service</th><th>Qty</th><th>Rate (₹)</th><th>Amount</th><th></th></tr></thead><tbody id="invItems"></tbody></table></div>'+
      '<div class="button-row invoice-controls"><button type="button" class="tool-btn secondary" id="invAddItem">+ Add item</button></div>'+
      '<div class="field-grid invoice-options">'+selectField("GST rate","invGstRate",[["0","No GST (0%)"],["0.25","0.25%"],["3","3%"],["5","5%"],["12","12%"],["18","18%"],["28","28%"]])+field("Discount (%)","invDiscount","number","0",'min="0" max="100" step="any"')+'</div>'+
      '<div class="field"><label for="invNotes">Notes / payment instructions (optional)</label><textarea id="invNotes" rows="3" placeholder="Thank you for your business. Payment details…"></textarea></div>'+
      '<div id="invTotals" class="invoice-totals"></div>'+
      '<div class="button-row invoice-actions"><button type="button" class="tool-btn" id="invDownload">Download PDF ↓</button><button type="button" class="tool-btn secondary" id="invPrint">Print invoice ↗</button></div>'+
      '<p class="hint">Before sending, verify your business details, invoice number, applicable GST rate and tax rules. This tool creates a basic invoice and does not verify tax compliance.</p>';
    const businessPhoneInput=$("#invContact");
    const customerContactInput=$("#invCustomerContact");
    [businessPhoneInput,customerContactInput].forEach(input=>{
      input.addEventListener("input",()=>{
        input.value=input.value.replace(/\\D/g,"").slice(0,10);
      });
    });
    const itemsBody=$("#invItems");
    let nextItemId=0;
    function addItem(name,qty,rate){
      const id=++nextItemId, tr=document.createElement("tr");
      tr.dataset.itemId=String(id);
      tr.innerHTML='<td><input class="inv-item-name" aria-label="Item or service name" type="text" placeholder="Item / service" value="'+(name||"")+'"></td><td><input class="inv-item-qty" aria-label="Quantity" type="number" min="0" step="any" value="'+(qty||"1")+'"></td><td><input class="inv-item-rate" aria-label="Rate in rupees" type="number" min="0" step="any" value="'+(rate||"0")+'"></td><td class="inv-line-total">₹0.00</td><td><button type="button" class="inv-remove" aria-label="Remove item" title="Remove item">×</button></td>';
      itemsBody.appendChild(tr);
      tr.querySelectorAll("input").forEach(input=>input.addEventListener("input",updateInvoice));
      tr.querySelector(".inv-remove").addEventListener("click",()=>{if(itemsBody.children.length===1){tr.querySelector(".inv-item-name").value="";tr.querySelector(".inv-item-qty").value="1";tr.querySelector(".inv-item-rate").value="0"}else tr.remove();updateInvoice()});
      updateInvoice();
    }
    function esc(value){return String(value==null?"":value).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]))}
    function readInvoice(){
      const rows=Array.from(itemsBody.querySelectorAll("tr")).map(tr=>({
        name:tr.querySelector(".inv-item-name").value.trim(),
        qty:Math.max(0,safeNum(tr.querySelector(".inv-item-qty").value)||0),
        rate:Math.max(0,safeNum(tr.querySelector(".inv-item-rate").value)||0)
      })).map(item=>({...item,amount:item.name?item.qty*item.rate:0}));
      const subtotal=rows.reduce((sum,item)=>sum+item.amount,0);
      const discountPct=Math.min(100,Math.max(0,safeNum($("#invDiscount").value)||0));
      const discount=subtotal*discountPct/100;
      const taxable=Math.max(0,subtotal-discount);
      const gstRate=safeNum($("#invGstRate").value)||0;
      const tax=taxable*gstRate/100;
      return {business:$("#invBusiness").value.trim(),contact:$("#invContact").value.trim(),address:$("#invAddress").value.trim(),gstin:$("#invGstin").value.trim(),customer:$("#invCustomer").value.trim(),customerContact:$("#invCustomerContact").value.trim(),customerAddress:$("#invCustomerAddress").value.trim(),number:$("#invNumber").value.trim()||"INVOICE",date:$("#invDate").value,due:$("#invDue").value,notes:$("#invNotes").value.trim(),rows:rows,subtotal:subtotal,discountPct:discountPct,discount:discount,taxable:taxable,gstRate:gstRate,tax:tax,total:taxable+tax};
    }
    function updateInvoice(){
      const data=readInvoice();
      Array.from(itemsBody.querySelectorAll("tr")).forEach((tr,i)=>{const item=data.rows[i];tr.querySelector(".inv-line-total").textContent="₹"+fmt(item.amount,2)});
      $("#invTotals").innerHTML='<div class="invoice-total-row"><span>Subtotal</span><b>₹'+fmt(data.subtotal,2)+'</b></div>'+
        (data.discountPct>0?'<div class="invoice-total-row"><span>Discount ('+fmt(data.discountPct,2)+'%)</span><b>− ₹'+fmt(data.discount,2)+'</b></div>':'')+
        '<div class="invoice-total-row"><span>Taxable amount</span><b>₹'+fmt(data.taxable,2)+'</b></div>'+
        (data.gstRate>0?'<div class="invoice-total-row"><span>GST ('+fmt(data.gstRate,2)+'%)</span><b>₹'+fmt(data.tax,2)+'</b></div>':'')+
        '<div class="invoice-total-row invoice-grand-total"><span>Total due</span><b>₹'+fmt(data.total,2)+'</b></div>';
    }
    function validInvoice(){
      const data=readInvoice();
      if(!data.business){toast("Enter your business or shop name first.");$("#invBusiness").focus();return null}
      if(!data.customer){toast("Enter the customer name first.");$("#invCustomer").focus();return null}
      if(!/^\\d{10}$/.test(data.contact)){toast("Business phone number must be exactly 10 digits.");businessPhoneInput.focus();return null}
      if(!/^\\d{10}$/.test(data.customerContact)){toast("Customer phone number must be exactly 10 digits.");customerContactInput.focus();return null}
      if(!data.number){toast("Enter an invoice number.");$("#invNumber").focus();return null}
      if(!data.rows.some(item=>item.name&&item.qty>0)){toast("Add at least one named item with quantity above zero.");return null}
      if(data.rows.some(item=>item.qty<0||item.rate<0)||data.discountPct<0||data.discountPct>100){toast("Please check quantity, rate and discount values.");return null}
      return data;
    }
    function buildInvoiceHtml(data){
      const rows=data.rows.filter(item=>item.name&&item.qty>0).map(item=>'<tr><td>'+esc(item.name)+'</td><td>'+fmt(item.qty,3)+'</td><td>₹'+fmt(item.rate,2)+'</td><td>₹'+fmt(item.amount,2)+'</td></tr>').join("");
      const detail=(label,value)=>value?'<p><strong>'+label+':</strong> '+esc(value)+'</p>':"";
      return '<!doctype html><html><head><meta charset="utf-8"><title>'+esc(data.number)+'</title><style>body{font:14px Arial,sans-serif;color:#222;margin:36px}h1{color:#d95e0b;margin-bottom:6px}h2{font-size:16px;margin-top:28px}p{margin:5px 0;line-height:1.45}.columns{display:flex;gap:40px;justify-content:space-between}.columns>div{flex:1}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border-bottom:1px solid #ddd;padding:10px 8px;text-align:left}th{background:#fff4eb}.totals{width:min(100%,340px);margin:20px 0 0 auto}.totals p{display:flex;justify-content:space-between;border-bottom:1px solid #eee;padding:7px 0}.totals .grand{font-size:19px;font-weight:bold;color:#d95e0b}.notes{white-space:pre-wrap;margin-top:24px}@media print{body{margin:15mm}}</style></head><body><h1>INVOICE</h1><p><strong>Invoice #:</strong> '+esc(data.number)+'</p><p><strong>Date:</strong> '+esc(data.date||"—")+' &nbsp; <strong>Due:</strong> '+esc(data.due||"—")+'</p><div class="columns"><div><h2>From</h2><p><strong>'+esc(data.business)+'</strong></p>'+detail("Address",data.address)+detail("Contact",data.contact)+detail("GSTIN",data.gstin)+'</div><div><h2>Bill to</h2><p><strong>'+esc(data.customer)+'</strong></p>'+detail("Address",data.customerAddress)+detail("Contact",data.customerContact)+'</div></div><table><thead><tr><th>Item / service</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead><tbody>'+rows+'</tbody></table><div class="totals"><p><span>Subtotal</span><strong>₹'+fmt(data.subtotal,2)+'</strong></p><p><span>Discount ('+fmt(data.discountPct,2)+'%)</span><strong>− ₹'+fmt(data.discount,2)+'</strong></p><p><span>Taxable amount</span><strong>₹'+fmt(data.taxable,2)+'</strong></p><p><span>GST ('+fmt(data.gstRate,2)+'%)</span><strong>₹'+fmt(data.tax,2)+'</strong></p><p class="grand"><span>Total due</span><strong>₹'+fmt(data.total,2)+'</strong></p></div>'+(data.notes?'<div class="notes"><h2>Notes / payment instructions</h2>'+esc(data.notes)+'</div>':"")+'<p style="margin-top:32px;color:#777">Thank you for your business.</p></body></html>';
    }
    $("#invAddItem").onclick=()=>addItem("","1","0");
    ["invDiscount","invGstRate","invBusiness","invContact","invAddress","invGstin","invCustomer","invCustomerContact","invCustomerAddress","invNumber","invDate","invDue","invNotes"].forEach(id=>{const el=$("#"+id);el.addEventListener("input",updateInvoice);el.addEventListener("change",updateInvoice)});
    $("#invDownload").onclick=()=>{
      const data=validInvoice();if(!data)return;
      if(!window.jspdf||!window.jspdf.jsPDF){toast("PDF library did not load. Please check your internet and try Print invoice.");return}
      const doc=new window.jspdf.jsPDF({unit:"mm",format:"a4"});
      const left=15,right=195;let y=18;
      doc.setFont("helvetica","bold");doc.setFontSize(22);doc.setTextColor(217,94,11);doc.text("INVOICE",left,y);
      doc.setFontSize(10);doc.setTextColor(45,45,45);y+=9;doc.text("Invoice #: "+data.number,left,y);doc.text("Invoice date: "+(data.date||"-"),right,y,{align:"right"});y+=6;doc.text("Due date: "+(data.due||"-"),right,y,{align:"right"});
      y+=9;doc.setFont("helvetica","bold");doc.text("FROM",left,y);doc.text("BILL TO",110,y);y+=6;doc.setFont("helvetica","normal");
      const from=[data.business,data.address,data.contact,data.gstin?"GSTIN: "+data.gstin:""].filter(Boolean);
      const to=[data.customer,data.customerAddress,data.customerContact].filter(Boolean);
      const fromLines=doc.splitTextToSize(from.join("\n"),80),toLines=doc.splitTextToSize(to.join("\n"),75);
      doc.text(fromLines,left,y);doc.text(toLines,110,y);y+=Math.max(fromLines.length,toLines.length)*5+7;
      const tableRows=data.rows.filter(item=>item.name&&item.qty>0).map(item=>[item.name,fmt(item.qty,3),"Rs. "+fmt(item.rate,2),"Rs. "+fmt(item.amount,2)]);
      if(typeof doc.autoTable==="function"){
        doc.autoTable({startY:y,head:[["Item / service","Qty","Rate","Amount"]],body:tableRows,theme:"grid",styles:{fontSize:9,cellPadding:3},headStyles:{fillColor:[255,240,228],textColor:[80,55,40]},columnStyles:{1:{halign:"right"},2:{halign:"right"},3:{halign:"right"}}});
        y=doc.lastAutoTable.finalY+8;
      }else{
        doc.setFont("helvetica","bold");doc.text("Item / service",left,y);doc.text("Qty",120,y,{align:"right"});doc.text("Rate",153,y,{align:"right"});doc.text("Amount",right,y,{align:"right"});y+=6;doc.setFont("helvetica","normal");
        tableRows.forEach(row=>{const lines=doc.splitTextToSize(row[0],85);if(y+Math.max(lines.length*4,6)>270){doc.addPage();y=18}doc.text(lines,left,y);doc.text(row[1],120,y,{align:"right"});doc.text(row[2],153,y,{align:"right"});doc.text(row[3],right,y,{align:"right"});y+=Math.max(lines.length*4,6)+2});
        y+=3;
      }
      if(y>250){doc.addPage();y=18}
      doc.setFont("helvetica","normal");doc.setFontSize(10);
      [["Subtotal","Rs. "+fmt(data.subtotal,2)],["Discount ("+fmt(data.discountPct,2)+"%)","- Rs. "+fmt(data.discount,2)],["Taxable amount","Rs. "+fmt(data.taxable,2)],["GST ("+fmt(data.gstRate,2)+"%)","Rs. "+fmt(data.tax,2)]].forEach(pair=>{doc.text(pair[0],125,y);doc.text(pair[1],right,y,{align:"right"});y+=6});
      doc.setFont("helvetica","bold");doc.setFontSize(13);doc.setTextColor(217,94,11);doc.text("TOTAL DUE",125,y+2);doc.text("Rs. "+fmt(data.total,2),right,y+2,{align:"right"});y+=12;
      if(data.notes){doc.setFont("helvetica","bold");doc.setFontSize(10);doc.setTextColor(45,45,45);doc.text("Notes / payment instructions",left,y);y+=6;doc.setFont("helvetica","normal");doc.setFontSize(9);doc.text(doc.splitTextToSize(data.notes,175),left,y)}
      doc.save((data.number.replace(/[^a-z0-9_-]/gi,"-")||"invoice")+".pdf");
      toast("Invoice PDF downloaded.");
    };
    $("#invPrint").onclick=()=>{const data=validInvoice();if(!data)return;const win=window.open("","_blank");if(!win){toast("Please allow pop-ups to print the invoice.");return}win.document.open();win.document.write(buildInvoiceHtml(data));win.document.close();win.focus();setTimeout(()=>win.print(),350)};
    addItem("Product / service","1","1000");
    updateInvoice();
  }

  function renderWords(){
    modalContent.innerHTML='<div class="field"><label for="wordText">Paste or type your text</label><textarea id="wordText" placeholder="Start typing here…"></textarea></div><div class="result-grid"><div class="result-chip"><span>Words</span><b id="wordCount">0</b></div><div class="result-chip"><span>Characters</span><b id="charCount">0</b></div><div class="result-chip"><span>No spaces</span><b id="charNoSpace">0</b></div><div class="result-chip"><span>Sentences</span><b id="sentenceCount">0</b></div><div class="result-chip"><span>Paragraphs</span><b id="paragraphCount">0</b></div><div class="result-chip"><span>Reading time</span><b id="readTime">0 min</b></div></div><div class="button-row"><button class="tool-btn secondary" id="clearWords">Clear text</button><button class="tool-btn secondary" id="copyWords">Copy stats</button></div>';
    const input=$("#wordText");function count(){const s=input.value.trim(),words=s?s.split(/\s+/u).filter(Boolean):[],sentences=s?s.split(/[.!?]+(?:\s|$)/u).filter(x=>x.trim()).length:0,paragraphs=s?s.split(/\n\s*\n/u).filter(x=>x.trim()).length:0;$("#wordCount").textContent=fmt(words.length,0);$("#charCount").textContent=fmt(input.value.length,0);$("#charNoSpace").textContent=fmt(input.value.replace(/\s/g,"").length,0);$("#sentenceCount").textContent=fmt(sentences,0);$("#paragraphCount").textContent=fmt(paragraphs,0);$("#readTime").textContent=words.length?Math.max(1,Math.ceil(words.length/200))+" min":"0 min"}input.addEventListener("input",count);$("#clearWords").onclick=()=>{input.value="";count();input.focus()};$("#copyWords").onclick=()=>{const t="Words: "+$("#wordCount").textContent+"\nCharacters: "+$("#charCount").textContent+"\nCharacters (no spaces): "+$("#charNoSpace").textContent+"\nSentences: "+$("#sentenceCount").textContent+"\nParagraphs: "+$("#paragraphCount").textContent+"\nReading time: "+$("#readTime").textContent;copyText(t)};
  }
  function renderUnits(){
    const groups={Length:[["mm","Millimeters",.001],["cm","Centimeters",.01],["m","Meters",1],["km","Kilometers",1000],["in","Inches",.0254],["ft","Feet",.3048],["yd","Yards",.9144],["mi","Miles",1609.344]],Weight:[["mg","Milligrams",.000001],["g","Grams",.001],["kg","Kilograms",1],["t","Metric tonnes",1000],["oz","Ounces",.028349523125],["lb","Pounds",.45359237]],Volume:[["ml","Milliliters",.001],["l","Liters",1],["tsp","Teaspoons",.00492892],["tbsp","Tablespoons",.0147868],["cup","US cups",.236588]],Time:[["sec","Seconds",1],["min","Minutes",60],["hr","Hours",3600],["day","Days",86400],["week","Weeks",604800]]};
    const opts=arr=>arr.map(x=>[x[0],x[1]]);modalContent.innerHTML=selectField("Category","unitCategory",[["Length","Length"],["Weight","Weight"],["Volume","Volume"],["Time","Time"],["Temperature","Temperature"]])+'<div class="field-grid">'+field("Value","unitValue","number","1",'step="any"')+selectField("From","unitFrom",opts(groups.Length))+'</div>'+selectField("To","unitTo",opts(groups.Length))+'<div id="unitResult"></div>';
    function fill(){const cat=$("#unitCategory").value,arr=groups[cat]||[];const f=$("#unitFrom"),t=$("#unitTo");if(cat==="Temperature"){f.innerHTML=[["C","Celsius"],["F","Fahrenheit"],["K","Kelvin"]].map(x=>'<option value="'+x[0]+'">'+x[1]+'</option>').join("");t.innerHTML=f.innerHTML;t.value="F"}else{const o=opts(arr);f.innerHTML=o.map(x=>'<option value="'+x[0]+'">'+x[1]+'</option>').join("");t.innerHTML=f.innerHTML;t.value=o[Math.min(1,o.length-1)][0]}convert()}
    function convert(){const n=safeNum($("#unitValue").value);if(n===null){$("#unitResult").innerHTML="";return}const cat=$("#unitCategory").value;let val;if(cat==="Temperature"){const from=$("#unitFrom").value,to=$("#unitTo").value,c=from==="C"?n:from==="F"?(n-32)*5/9:n-273.15;val=to==="C"?c:to==="F"?c*9/5+32:c+273.15}else{const arr=groups[cat],a=arr.find(x=>x[0]===$("#unitFrom").value),b=arr.find(x=>x[0]===$("#unitTo").value);val=n*a[2]/b[2]}$("#unitResult").innerHTML=panel("Converted value",fmt(val,6)+" "+$("#unitTo").value.toUpperCase())}
    $("#unitCategory").onchange=fill;["unitValue","unitFrom","unitTo"].forEach(id=>$("#"+id).addEventListener(id==="unitValue"?"input":"change",convert));fill();
  }
  function renderQr(){
    modalContent.innerHTML='<div class="field"><label for="qrText">Website URL or text</label><input id="qrText" type="text" placeholder="https://example.com" value="https://example.com"></div><div class="field-grid">'+selectField("QR size","qrSize",[["160","Small — 160px"],["220","Medium — 220px"],["300","Large — 300px"]]).replace('<option value="220">Medium — 220px</option>','<option value="220" selected>Medium — 220px</option>')+selectField("Error correction","qrLevel",[["L","Low"],["M","Medium"],["Q","Quartile"],["H","High"]]).replace('<option value="Q">Quartile</option>','<option value="Q" selected>Quartile</option>')+'</div><button class="tool-btn" id="makeQr">Generate QR code ↗</button><div id="qrResult" class="qr-output"></div><p class="hint">The QR code is generated in your browser. Check the encoded link before sharing.</p>';
    $("#makeQr").onclick=()=>{const text=$("#qrText").value.trim();if(!text){toast("Enter a link or some text first.");return}if(typeof QRCode==="undefined"){toast("QR library did not load. Check your internet connection.");return}const out=$("#qrResult");out.innerHTML="";const box=document.createElement("div");out.appendChild(box);try{new QRCode(box,{text,width:Number($("#qrSize").value),height:Number($("#qrSize").value),correctLevel:QRCode.CorrectLevel[$("#qrLevel").value]});const dl=document.createElement("button");dl.className="tool-btn secondary";dl.textContent="Download PNG";dl.onclick=()=>{const img=box.querySelector("img"),canvas=box.querySelector("canvas"),url=img&&img.src?img.src:canvas?canvas.toDataURL("image/png"):"";if(!url){toast("Could not create a downloadable image.");return}downloadUrl(url,"smarttools-qr.png")};out.appendChild(dl)}catch(e){toast("Could not generate this QR code.")}};
  }
  function renderImage(){
    modalContent.innerHTML='<div class="drop-zone"><strong>Choose an image</strong><p>JPG, PNG, WebP and other browser-supported image formats</p><input type="file" id="imageFile" accept="image/*"></div><div id="imageControls" hidden><div class="field-grid">'+selectField("Output format","imageFormat",[["image/jpeg","JPG"],["image/png","PNG"],["image/webp","WebP"]])+'<div class="field-pair">'+field("Compress image to","targetSize","number","100",'min="1" step="any"')+selectField("Size unit","targetUnit",[["KB","KB"],["MB","MB"]])+'</div><div class="field-pair">'+field("Width (px)","imageWidth","number","",'min="1"')+field("Height (px)","imageHeight","number","",'min="1"')+'</div></div><label class="field-label"><input type="checkbox" id="keepRatio" checked> Keep aspect ratio</label><div class="button-row"><button class="tool-btn" id="processImage">Compress image ↗</button></div><div id="imageResult"></div></div><p class="hint">Set a target as low as 1 KB (for example, 5 KB). The tool first reduces encoding quality and, if needed, dimensions to get as close as possible. Very small sizes can noticeably reduce image quality; exact size is not guaranteed.</p>';
    let img=null,originalName="image";
    $("#imageFile").onchange=()=>{const file=$("#imageFile").files[0];if(!file)return;if(!file.type.startsWith("image/")){toast("Choose a valid image file.");return}if(img&&img.src.startsWith("blob:"))URL.revokeObjectURL(img.src);originalName=file.name.replace(/\\.[^.]+$/,"")||"image";img=new Image();img.onload=()=>{$("#imageControls").hidden=false;$("#imageWidth").value=img.naturalWidth;$("#imageHeight").value=img.naturalHeight;$("#imageResult").innerHTML=panel("Original image",fmt(file.size/1024)+" KB",img.naturalWidth+" × "+img.naturalHeight+" px")};img.onerror=()=>toast("This image could not be opened.");img.src=URL.createObjectURL(file)};
    $("#imageWidth").addEventListener("input",()=>{if($("#keepRatio").checked&&img&&img.naturalWidth){const w=safeNum($("#imageWidth").value);if(w>0)$("#imageHeight").value=Math.max(1,Math.round(w*img.naturalHeight/img.naturalWidth))}});
    $("#imageHeight").addEventListener("input",()=>{if($("#keepRatio").checked&&img&&img.naturalHeight){const h=safeNum($("#imageHeight").value);if(h>0)$("#imageWidth").value=Math.max(1,Math.round(h*img.naturalWidth/img.naturalHeight))}});
    function canvasBlob(canvas,type,quality){return new Promise(resolve=>canvas.toBlob(resolve,type,quality))}
    $("#processImage").onclick=async()=>{if(!img)return;let w=safeNum($("#imageWidth").value),h=safeNum($("#imageHeight").value);const size=safeNum($("#targetSize").value),unit=$("#targetUnit").value,format=$("#imageFormat").value;
      if(!size||size<=0){toast("Enter the desired image size.");return}
      const targetBytes=size*(unit==="MB"?1024*1024:1024);
      if(targetBytes<1024){toast("Desired size must be at least 1 KB.");return}
      if(!w||!h||w<1||h<1||w>12000||h>12000){toast("Enter valid dimensions between 1 and 12000 pixels.");return}
      const btn=$("#processImage");btn.disabled=true;btn.textContent="Compressing…";
      try{
        const canvas=document.createElement("canvas");let ctx,blob=null,quality=0.92,attempt=0;
        const draw=()=>{canvas.width=Math.max(1,Math.round(w));canvas.height=Math.max(1,Math.round(h));ctx=canvas.getContext("2d");if(format==="image/jpeg"){ctx.fillStyle="#fff";ctx.fillRect(0,0,canvas.width,canvas.height)}ctx.drawImage(img,0,0,canvas.width,canvas.height)};
        draw();blob=await canvasBlob(canvas,format,quality);
        if(!blob)throw new Error("Could not export image in this format.");
        while(blob.size>targetBytes&&attempt<45){
          attempt++;
          if(format!=="image/png"&&quality>0.12){
            quality=Math.max(0.1,quality-0.08);
          }else{
            const scale=Math.min(0.9,Math.sqrt(targetBytes/blob.size)*0.92);
            const nextW=Math.max(1,Math.floor(w*scale)),nextH=Math.max(1,Math.floor(h*scale));
            if(nextW===w&&nextH===h)break;
            w=nextW;h=nextH;draw();quality=format==="image/png"?undefined:Math.max(0.1,quality-0.03);
          }
          blob=await canvasBlob(canvas,format,quality);
          if(!blob)throw new Error("Could not export image in this format.");
          if(w===1&&h===1&&blob.size>targetBytes)break;
        }
        const url=URL.createObjectURL(blob),ext=format==="image/jpeg"?"jpg":format==="image/png"?"png":"webp",met=blob.size<=targetBytes;
        $("#imageWidth").value=canvas.width;$("#imageHeight").value=canvas.height;
        const note="Output resolution: "+canvas.width+" × "+canvas.height+" px • "+(met?"Target size reached":"Could not reach target exactly");
        $("#imageResult").innerHTML=panel("Compressed image",fmt(blob.size/1024)+" KB",note)+'<div class="button-row"><button class="tool-btn" id="downloadImage">Download image</button></div>';
        $("#downloadImage").onclick=()=>downloadUrl(url,originalName+"-smarttools."+ext);
        if(!met)toast("Could not reach that size exactly. Try JPG/WebP or a slightly larger target.");
      }catch(err){toast(String(err&&err.message||"Image processing failed."))}
      finally{btn.disabled=false;btn.textContent="Compress image ↗"}
    };
  }
  function renderPdf(){
    modalContent.innerHTML='<div class="field"><label for="pdfAction">PDF action</label><select id="pdfAction"><option value="merge">Merge PDF files</option><option value="split">Extract pages from a PDF</option><option value="compress">Optimize PDF (basic)</option></select></div><div class="drop-zone"><strong>Select PDF file(s)</strong><p>For merge, choose 2 or more PDFs. For other actions, choose one PDF.</p><input type="file" id="pdfFiles" accept="application/pdf,.pdf" multiple></div><div id="pdfExtra"></div><div id="pdfFileNames" class="file-list"></div><button class="tool-btn" id="processPdf">Process PDF ↗</button><div id="pdfResult"></div><p class="hint">PDF operations use PDF-Lib in your browser. The basic optimization option removes unused objects where possible; it cannot guarantee a smaller file for every PDF.</p>';
    $("#pdfAction").onchange=()=>{$("#pdfFiles").multiple=$("#pdfAction").value==="merge";$("#pdfExtra").innerHTML=$("#pdfAction").value==="split"?'<div class="field"><label for="pdfPages">Pages to extract (e.g. 1, 3-5)</label><input id="pdfPages" type="text" placeholder="1, 3-5"></div>':"";$("#pdfFileNames").textContent=""};
    $("#pdfFiles").onchange=()=>{$("#pdfFileNames").textContent=Array.from($("#pdfFiles").files).map(f=>f.name+" ("+fmt(f.size/1024)+" KB)").join(" • ")};
    $("#processPdf").onclick=async()=>{if(typeof PDFLib==="undefined"){toast("PDF library did not load. Check your internet connection.");return}const files=Array.from($("#pdfFiles").files),action=$("#pdfAction").value,out=$("#pdfResult");if(!files.length){toast("Choose at least one PDF file.");return}if(action==="merge"&&files.length<2){toast("Choose at least two PDF files to merge.");return}if(action!=="merge"&&files.length!==1){toast("Choose one PDF file for this action.");return}if(files.some(f=>f.type&&f.type!=="application/pdf"&&!f.name.toLowerCase().endsWith(".pdf"))){toast("Only PDF files are supported.");return}const btn=$("#processPdf");btn.disabled=true;btn.textContent="Processing…";out.innerHTML="";
      try{let resultBytes,filename="smarttools-pdf.pdf";if(action==="merge"){const merged=await PDFLib.PDFDocument.create();for(const file of files){const doc=await PDFLib.PDFDocument.load(await file.arrayBuffer());const pages=await merged.copyPages(doc,doc.getPageIndices());pages.forEach(p=>merged.addPage(p))}resultBytes=await merged.save();filename="merged-pdf.pdf"}else{const doc=await PDFLib.PDFDocument.load(await files[0].arrayBuffer());if(action==="split"){const spec=$("#pdfPages").value.trim();if(!spec){toast("Enter page numbers to extract.");return}const wanted=new Set();for(const part of spec.split(",")){const p=part.trim().split("-").map(x=>Number(x.trim()));if(p.some(x=>!Number.isInteger(x)||x<1||x>doc.getPageCount())||p.length>2||(p.length===2&&p[0]>p[1]))throw new Error("Page range is invalid. This PDF has "+doc.getPageCount()+" pages.");for(let i=p[0];i<=(p[1]||p[0]);i++)wanted.add(i-1)}const newDoc=await PDFLib.PDFDocument.create(),pages=await newDoc.copyPages(doc,Array.from(wanted).sort((a,b)=>a-b));pages.forEach(p=>newDoc.addPage(p));resultBytes=await newDoc.save();filename="extracted-pages.pdf"}else{resultBytes=await doc.save({useObjectStreams:true,addDefaultPage:false});filename="optimized-pdf.pdf"}}const blob=new Blob([resultBytes],{type:"application/pdf"}),url=URL.createObjectURL(blob);out.innerHTML=panel("PDF ready",fmt(blob.size/1024)+" KB","Output file: "+filename)+'<div class="button-row"><button class="tool-btn" id="downloadPdf">Download PDF</button></div>';$("#downloadPdf").onclick=()=>downloadUrl(url,filename)}catch(err){out.innerHTML=panel("Could not process PDF","Please check the file",String(err&&err.message||"This PDF may be encrypted or unsupported."))}finally{btn.disabled=false;btn.textContent="Process PDF ↗"}};
  }
  function copyText(text){if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(text).then(()=>toast("Copied to clipboard.")).catch(()=>fallbackCopy(text))}else fallbackCopy(text)}
  function fallbackCopy(text){const t=document.createElement("textarea");t.value=text;t.style.position="fixed";t.style.opacity="0";document.body.appendChild(t);t.select();try{document.execCommand("copy");toast("Copied to clipboard.")}catch(e){toast("Copy failed. Please select and copy manually.")}t.remove()}
  function downloadUrl(url,name){const a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove()}
})();