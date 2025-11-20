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
