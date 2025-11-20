import { IExperience, IMember, IAMember, inputFields } from './utility/mytypes.js';
import { checkRoomeAndRole, stringValidate, toRoleEnumValue, toRoomEnumValue } from "./utility/helpers.js";

const unassignedMemberKey = "unassignedMemberKey"
const assignedMemberKey = "assignedMemberKey"

let experienceId = 0;

let zonesCapacity = {
  vault: 0,
  staff: 0, reception: 0,
  server: 0, security: 0, conference: 0
}

type ZoneType = keyof typeof zonesCapacity;

let unassignedMembers: IMember[] = [];
let assignedMembers: IAMember[] = [];

const modal = document.getElementById('modal')!;
const addBtn = document.getElementById('add-member')!;
const form = document.getElementById('form') as HTMLFormElement;
const imgPrev = document.getElementById("preview") as HTMLImageElement;


//// local storage

function localStorageZoneCapacity() {
  localStorage.setItem("zone-capacity", JSON.stringify(zonesCapacity));
}

function getLocalStorZoneCapacity() {
  Object.assign(zonesCapacity, JSON.parse(localStorage.getItem("zone-capacity") || `{}`));
  console.log("capacity: ", zonesCapacity);
}

function saveInlocalStorage() {
  localStorage.setItem(unassignedMemberKey, JSON.stringify(unassignedMembers));
  localStorage.setItem(assignedMemberKey, JSON.stringify(assignedMembers));
}

function getFromLocalStrorage() {
  unassignedMembers = JSON.parse(localStorage.getItem(unassignedMemberKey) || "[]");
  assignedMembers = JSON.parse(localStorage.getItem(assignedMemberKey) || "[]");

  const l = document.getElementById("member-list")!;
  l.innerHTML = `<p class='no-members ${unassignedMembers.length === 0 ? "" : "is-hidden"}'>No member here</p>`;

  unassignedMembers.forEach((m) => renderSideBar(m));
}


function checkObligatoryZone() {
  const polygones = Array.from(document.getElementsByTagName("polygon"))
    .filter((zone) => !zone.dataset.room!.includes("conference") && !zone.dataset.room!.includes("reception"))
  console.log(polygones);

  polygones.forEach((zone) => {
    const zoneName = zone.dataset.room! as ZoneType;
    if (zonesCapacity[zoneName] == 0) {
      zone.classList.add("empty")
    } else {
      zone.classList.remove("empty")
    }
  })


}


// drag and drop

function onDrop(e: DragEvent) {
  e.preventDefault()
  const canvas = document.getElementById('canvas')!
  const dataTransfer = (e as DragEvent).dataTransfer
  const memberType = dataTransfer?.getData('role') || ''
  const memberName = dataTransfer?.getData('name') || 'unkown'
  const memberImage = dataTransfer?.getData('image') || 'img'
  const memberEmail = dataTransfer?.getData('email') || 'email'
  const memberPhone = dataTransfer?.getData('phone') || 'phone'
  const memberZone = dataTransfer?.getData('zone') || '';

  const memberExpers = JSON.parse(dataTransfer?.getData("expers") || "[]") as IExperience[]
  const id = dataTransfer?.getData('id') || ''

  const sidebarMemberEl = document.getElementById(`side-${id}`)
  const canvasMemberEl = document.getElementById(`can-${id}`)

  const zone = document.elementFromPoint(
    e.clientX,
    e.clientY
  ) as HTMLElement | null

  if (!zone || zone.tagName !== 'polygon') {
    alert('Please drag to valid room')
    return
  }

  const isAllowed = checkRoomeAndRole(
    toRoleEnumValue(memberType)!,
    toRoomEnumValue(zone.dataset.room!)
  )

  if (!isAllowed) {
    alert('You drag wrong member to zone')
    return
  }
  if (memberZone == zone.dataset.room) {
    console.log("samename");

    return;
  }
  ////
  const zoneName = zone.dataset.room! as ZoneType;
  const zoneCapacity = +zone.dataset.capacity!
  if (zonesCapacity[zoneName] < zoneCapacity) {
    console.log("dkhal");

    zonesCapacity[zoneName]++;
    localStorageZoneCapacity()
    checkObligatoryZone()
    // console.log("dkhaaaal");

  } else {
    alert('The zone has filled')
    return
  }
  ////

  const rect = canvas.getBoundingClientRect();
  const newEl = createStackElement(
    e,
    rect,
    memberName,
    memberImage,
    memberType,
    id,
    memberEmail,
    memberPhone,
    zone.dataset.room!,
    memberExpers
  )

  if (sidebarMemberEl) sidebarMemberEl.remove()
  if (canvasMemberEl) canvasMemberEl.remove()

  canvas.appendChild(newEl)
}

function dragAndDrop() {
  const canvas = document.getElementById('canvas')

  assignedMembers.push(...JSON.parse(localStorage.getItem(assignedMemberKey) || "[]"));

  assignedMembers.forEach((m: IAMember) => {
    const ele = initStackElements(m);
    canvas?.appendChild(ele)
  })

  canvas?.addEventListener('dragover', (e) => {
    e.preventDefault()
  })

  canvas?.addEventListener('drop', onDrop)
}

function createStackElement(
  e: DragEvent,
  rect: DOMRect,
  memberName: string,
  memberImage: string,
  memberType: string,
  id: string,
  memberEmail: string,
  memberPhone: string,
  memberZone: string,
  memberExpers: IExperience[]
) {
  console.log();

  const mem: IMember = {
    id: +id,
    image: memberImage,
    name: memberName,
    email: memberEmail,
    phone: memberPhone,
    role: toRoleEnumValue(memberType)!,
    zone: memberZone,
    experience: memberExpers,
  };

  const oldAssign = assignedMembers.find((a) => a.id === +id);
  if (oldAssign) {
    const idx = assignedMembers.indexOf(oldAssign!);
    if (idx > -1) assignedMembers.splice(idx, 1);
  }

  let assignMem = {
    left: 0, top: 0, ...mem
  };
  assignedMembers.push(assignMem);

  const unIndex = unassignedMembers.findIndex((u) => u.id == assignMem.id);
  if (unIndex > -1) {
    unassignedMembers.splice(unIndex, 1)
  }

  if (unassignedMembers.length == 0) {
    document.querySelector("#member-list p")?.classList.remove("is-hidden")
  }

  const localX = e.clientX - rect.left
  const localY = e.clientY - rect.top

  const yPercent = (localY * 100) / rect.height
  const xPercent = (localX * 100) / rect.width

  assignMem.top = yPercent;
  assignMem.left = xPercent;

  saveInlocalStorage()
  saveInlocalStorage()

  const newEl = document.createElement('div')

  newEl.id = `can-${id}`

  const image = document.createElement('img')
  const xBtn = document.createElement('div')
  xBtn.classList.add('close-btn')
  xBtn.textContent = "x"
  xBtn.onclick = () => {
    newEl.remove()
    unassignedMembers.push(mem);
    // const unIdx = unassignedMembers.findIndex((m) => m.id === mem.id)
    const assignedIdx = assignedMembers.findIndex((m) => m.id === mem.id)
    if (assignedIdx > -1) assignedMembers.splice(assignedIdx, 1)

    renderSideBar(mem)
    saveInlocalStorage()
    const zoneName = memberZone as ZoneType;

    zonesCapacity[zoneName]--;
    localStorageZoneCapacity()
    checkObligatoryZone()
    mem.zone = ""
    localStorage.setItem(unassignedMemberKey, JSON.stringify(unassignedMembers))
    document.querySelector("#member-list p")?.classList.add("is-hidden")
  }

  image.src = memberImage || ''
  image.alt = memberName || 'unkown'
  image.className = 'image'
  image.classList.add('image-config')
  image.onclick = () => {
    openDetailModal(mem)
  }

  newEl.classList.add('member-zone')
  newEl.style.left = xPercent + '%'
  newEl.style.top = yPercent + '%'

  newEl.appendChild(image)
  newEl.appendChild(xBtn)

  newEl.addEventListener('dragstart', (e: DragEvent) => {
    const data = e.dataTransfer
    data!.setData('role', (mem.role as unknown as string))
    data!.setData('name', mem.name)
    data!.setData('email', mem.email)
    data!.setData('phone', mem.phone)
    data!.setData('image', mem.image)
    data!.setData('zone', mem.zone)
    data!.setData('expers', JSON.stringify(mem.experience))
    data!.setData('id', mem.id.toString())
  })

  return newEl
}



function initStackElements(member: IAMember) {
  const newEl = document.createElement('div')

  newEl.id = `can-${member.id}`

  const image = document.createElement('img')
  const xBtn = document.createElement('div')
  xBtn.classList.add('close-btn')
  xBtn.textContent = "x"
  xBtn.onclick = () => {
    newEl.remove()
    unassignedMembers.push(member);
    const assignedIdx = assignedMembers.findIndex((d) => d.id == member.id)
    if (assignedIdx > -1) assignedMembers.splice(assignedIdx, 1)
    renderSideBar(member)
    saveInlocalStorage()

    const zoneName = member.zone as ZoneType;

    zonesCapacity[zoneName]--;
    localStorageZoneCapacity()
    checkObligatoryZone()

    checkObligatoryZone()
    localStorage.setItem(unassignedMemberKey, JSON.stringify(unassignedMembers))
    document.querySelector("#member-list p")?.classList.add("is-hidden")
  }

  image.src = member.image || ''
  image.alt = member.name || 'unkown'
  image.className = 'image'
  image.classList.add('image-config')
  newEl.classList.add('member-zone')
  newEl.style.left = member.left + '%'
  newEl.style.top = member.top + '%'

  newEl.onclick = () => {
    openDetailModalCan(member)
  }
  newEl.appendChild(image)
  newEl.appendChild(xBtn)

  newEl.addEventListener('dragstart', (e: DragEvent) => {
    const data = e.dataTransfer
    data!.setData('role', (member.role as unknown as string))
    data!.setData('name', member.name)
    data!.setData('image', member.image)
    data!.setData('phone', member.phone)
    data!.setData('zone', member.zone)
    data!.setData('email', member.email)
    data?.setData('expers', JSON.stringify(member.experience))
    console.log(member.experience);
    data?.setData('id', member.id.toString())
  })

  return newEl
}



// modal
function initModal() {
  addBtn.addEventListener("click", () => {
    modal.classList.remove("is-hidden");
    removeErrorMsg();
    previewImage();
  });

  const closeBtn = document.getElementById("close-modal")!;
  closeBtn.addEventListener("click", closeModal);
}

function closeModal() {
  form.reset();
  removeExpDom()
  imgPrev.src = "./assets/avatars/favatar.webp";
  modal.classList.add("is-hidden");
}

function removeExpDom() {
  document.querySelectorAll(".experiences .experience").forEach((e) => (e as HTMLElement).outerHTML = "");
}

function extractExper(): IExperience[] | null {
  const allExpItems = document.querySelectorAll<HTMLElement>(".experience");
  if (allExpItems.length === 0) return [];

  const experiences: IExperience[] = [];

  allExpItems.forEach((e) => {
    const id = e.id;

    const company = e.querySelector(`#company-${id}`) as HTMLInputElement;
    const role = e.querySelector(`#role-${id}`) as HTMLInputElement;
    const from = ((e.querySelector(`#startDate-${id}`) as HTMLInputElement));
    const endVal = (e.querySelector(`#endDate-${id}`) as HTMLInputElement);
    const to = endVal && endVal.value ? new Date(endVal.value) : null;

    const inputs = { company, role, from: from, to: endVal };

    if (validateExperHtmlInputs(inputs)) {
      experiences.push({ id, company: company.value, role: role.value, from: new Date(from.value), to });
    }
  });

  return experiences.length === 0 ? null : experiences;
}

function experienceGene(id: number): HTMLElement {
  const container = document.createElement("div");
  container.className = "experience";
  container.id = `${id}`;

  const head = document.createElement("div");
  head.className = "exp-head";

  const title = document.createElement("p");
  title.textContent = `Experience`;

  const delBtn = document.createElement("button");
  delBtn.textContent = "Delete";
  delBtn.addEventListener("click", () => container.remove());

  head.appendChild(title);
  head.appendChild(delBtn);

  const createField = (label: string, id: string, type: string) => {
    const group = document.createElement("div");
    group.className = "form__group";

    group.innerHTML = `
      <label class="form__label" for="${id}">${label}</label>
      <input id="${id}" class="input" type="${type}" />
    `;

    return group;
  };

  container.appendChild(head);
  container.appendChild(createField("Company", `company-${id}`, "text"));
  container.appendChild(createField("Role", `role-${id}`, "text"));
  container.appendChild(createField("Start Date", `startDate-${id}`, "date"));
  container.appendChild(createField("End Date", `endDate-${id}`, "date"));

  return container;
}

function initForm() {
  const expBtn = document.querySelector(".btn-add-exp");

  expBtn?.addEventListener("click", () => {
    const exp = experienceGene(experienceId++);
    const container = document.querySelector(".experiences")!;
    container.insertBefore(exp, expBtn);
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    removeErrorMsg();

    const nameInput = document.getElementById("name") as HTMLInputElement;
    const emailInput = document.getElementById("email") as HTMLInputElement;
    const phoneInput = document.getElementById("phone") as HTMLInputElement;
    const imageInput = document.getElementById("image") as HTMLInputElement;
    const roleSelect = document.getElementById("role") as HTMLSelectElement;

    const fields = {
      name: nameInput,
      email: emailInput,
      phone: phoneInput,
      image: imageInput
    };

    const valid = validateHtmlInputs(fields);
    const experiences = extractExper();

    if (valid && experiences !== null) {
      const member: IMember = {
        id: Math.random(),
        name: nameInput.value,
        role: toRoleEnumValue(roleSelect.value)!,
        email: emailInput.value,
        phone: phoneInput.value,
        image: imageInput.value,
        zone: "",
        experience: experiences
      };

      document.querySelector("#member-list p")?.classList.add("is-hidden")
      unassignedMembers.push(member);
      saveInlocalStorage();
      renderSideBar(member);
      closeModal();
    }
  });
}

function createExperienceItem(index: string, experience: IExperience) {
  const wrapper = document.createElement("div");
  wrapper.className = "experience";
  wrapper.id = index;
  wrapper.setAttribute("data-exp-id", String(index));

  const head = document.createElement("div");
  head.className = "exp-head";

  const title = document.createElement("p");
  title.textContent = "Experience";

  head.appendChild(title);
  wrapper.appendChild(head);

  const createInputGroup = (labelTxt: string, idBase: string, type: string, value: string | Date = "") => {
    const group = document.createElement("div");
    group.className = "form__group";

    const label = document.createElement("label");
    label.className = "form__label";
    label.setAttribute("for", `${idBase}-${index}`);
    label.textContent = labelTxt;

    const input = document.createElement("input");
    input.className = "input";
    input.id = `${idBase}-${index}`;
    input.type = type;

    if (type == "date") {
      const myDate = new Date(value);
      try {
        const ymd = myDate.toISOString().split("T")[0].trim();
        input.value = ymd;
      } catch (error) {

      }
    } else {
      input.value = value as string;
    }

    group.appendChild(label);
    group.appendChild(input);
    return group;
  };

  wrapper.appendChild(
    createInputGroup("Company", "company", "text", experience?.company || "")
  );
  wrapper.appendChild(
    createInputGroup("Role", "role", "text", experience?.role || "")
  );
  wrapper.appendChild(
    createInputGroup("Start Date", "startDate", "date", experience.from)
  );
  wrapper.appendChild(
    createInputGroup("End Date", "endDate", "date", experience?.to || "")
  );

  return wrapper;
}


function previewImage() {
  const imageInput = document.getElementById("image") as HTMLInputElement;

  imageInput.addEventListener("change", () => {
    imgPrev.src = imageInput.value
  });
}

function validateHtmlInputs(inputs: { [k: string]: HTMLInputElement }) {
  let ok = true;

  Object.entries(inputs).forEach(([key, input]) => {
    if (!stringValidate(input.value.trim(), key as inputFields)) {
      addErrorMessage(input, `Please enter a valid ${key}`, key);
      ok = false;
    }
  });

  return ok;
}

function validateExperHtmlInputs(inputs: { [k: string]: HTMLInputElement }) {
  let ok = true;

  if (!stringValidate(inputs.company.value, "name")) {
    addErrorMessage(inputs.company, "Please enter a valid company", "company");
    ok = false;
  }
  if (!stringValidate(inputs.role.value.trim(), "name")) {
    addErrorMessage(inputs.role, "Please enter a valid role", "role");
    ok = false;
  }

  if (!inputs.from.value.trim()) {
    addErrorMessage(inputs.from, "Please enter a valid start date", "startDate");
    ok = false;
  } else if (new Date(inputs.from.value) > new Date(Date.now())) {
    addErrorMessage(inputs.from, "Please enter a valid range date", "startDate");
    ok = false;
  }

  if (inputs.to && inputs.to.value && new Date(inputs.from.value) > new Date(inputs.to.value)) {
    addErrorMessage(inputs.to, "Please end should be great than start date", "endDate");
    ok = false;
  }

  return ok;
}

function addErrorMessage(el: HTMLElement, msg: string, cls: string) {
  removeSpecificError(el.parentElement!);

  const d = document.createElement("div");
  d.className = `error-msg ${cls}`;
  d.textContent = msg;

  el.parentElement!.appendChild(d);
}

function removeSpecificError(parent: HTMLElement) {
  parent.querySelector(".error-msg")?.remove();
}

function removeErrorMsg() {
  document.querySelectorAll(".error-msg").forEach((e) => e.remove());
}
