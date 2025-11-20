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
