<template>
<div class="coursepage">
  <div class="header">
    Course Planner
  </div>

  <!--COURSES TAKEN-->
  <div class="courses-list-button" @click="coursesOpen = !coursesOpen">
    <i class="fas fa-angle-down" :style="!coursesOpen ? 'transform: rotate(270deg)' : ''"/> 
    Courses Taken 
  </div>
  <div class="courses-lists" :style="!coursesOpen ? 'max-height: 0px; margin: 0' : 'max-height: 300px'">
    <div class="taken-courses-wrapper">

      <span class="course-list-header">Taken Courses</span>
      <div class="course-list-overflow">
        <TransitionGroup name="taken-fade">
        <div v-for="(course,ind) in studentCourses" class="taken-course" :key="course" :style="ind == 0 ? 'margin-top: 0' : ''">
          <span class="taken-course-name">
            <span class="taken-course-ind">{{(ind+1) + ')'}}</span>
            {{course}}
          </span>
          <span class="remove-taken-course" @click="removeTakenCourse(course)">X</span>
        </div>
        </TransitionGroup>
      </div>
    </div>
    <div class = "all-courses-wrapper">
      <span class="course-list-header">All courses</span>
      <div class="course-list-overflow">
        <TransitionGroup name="all-fade">
        <div v-for="(course,ind) in allCourses" class="taken-course" :key="course" :style="ind == 0 ? 'margin-top: 0' : ''">
          <span class="taken-course-name">{{course}}</span>
          <span class="add-taken-course" @click="addTakenCourse(course)">+</span>
        </div>
        </TransitionGroup>
      </div>
    </div>
  </div>


  <!--Time Restrictions-->
  <div class="courses-list-button" @click="preferencesOpen = !preferencesOpen">
    <i class="fas fa-angle-down" :style="!preferencesOpen ? 'transform: rotate(270deg)' : ''"/> 
    Time Restrictions
  </div>
  <div class="courses-lists flex-down" :style="!preferencesOpen ? 'max-height: 0px; margin: 0;': 'max-height: 400px'">
    <div class="course-list-header space-below">
      Time Restrictions
    </div>
    <div class="time-wrapper">
    <TransitionGroup name="taken-fade">
      <div v-for="(t,i) in timeRestrictions" :key="t.start + '-' + t.end" class="time-restrictions-each" :style="i == 0 ? 'margin-top: 0' : ''">
        {{i+1 + ') ' + t.start + ' to ' + t.end + ' ('+ (t.day == 'Everyday' ? 'M-F' : (t.day == 'Thursday' ? 'Th' : t.day.charAt(0)))+')'}}
        <span class="remove-taken-course" @click="removeTimeRestriction(i)">X</span>
      </div>
    </TransitionGroup>
    </div>
      <div style="margin-top: 20px">
        <button @click="timeRestrictions.push({start: curStartTime, end: curEndTime, day: curWeekday})" style="margin-right: 40px">Add</button>
        <select v-model="curStartTime">
          <option v-for="start in [8,9,10,11,12,13,14,15,16,17,18,19,20]" :key="start">
            {{start &lt; 12 ? start + ' AM' : (start == 12 ? 12 : start - 12) + ' PM'}}
          </option>
        </select>
        &nbsp;to&nbsp;
        <select v-model="curEndTime">
          <option v-for="end in [8,9,10,11,12,13,14,15,16,17,18,19,20]" :key="end">
            {{end &lt; 12 ? end + ' AM' : (end == 12 ? 12 : end - 12) + ' PM'}}
          </option>
        </select>
        <select v-model="curWeekday" style="margin-left: 10px">
          <option v-for="day in ['Everyday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']" :key="day">
            {{day}}
          </option>
        </select>
      </div>
  </div>

  
  <!--Professor Prefences-->
  <div class="courses-list-button" @click="professorOpen = !professorOpen">
    <i class="fas fa-angle-down" :style="!professorOpen ? 'transform: rotate(270deg)' : ''"/> 
    Professor Preferences
  </div>
  <div class="courses-lists flex-down" :style="!professorOpen ? 'max-height: 0px' : 'max-height: 280px'">
    <div style="display: flex; justify-content: space-evenly;">
      <div>
        Prefer Professors
        <div class="time-wrapper">
        <TransitionGroup name="taken-fade">
          <div v-for="(t,i) in goodProfs" :key="t" class="time-restrictions-each" :style="i == 0 ? 'margin-top: 0' : ''">
            {{t}}
            <span class="remove-taken-course" @click="removeGoodProfessor(i)">X</span>
          </div>
        </TransitionGroup>
        </div>
      </div>
      <div>
        Avoid Professors
        <div class="time-wrapper">
        <TransitionGroup name="taken-fade">
          <div v-for="(t,i) in badProfs" :key="t" class="time-restrictions-each" :style="i == 0 ? 'margin-top: 0' : ''">
            {{t}}
            <span class="remove-taken-course" @click="removeBadProfessor(i)">X</span>
          </div>
        </TransitionGroup>
        </div>
      </div>
    </div>
      <div style="margin-top: 20px">
        <button @click="goodProfs.push(curProf)" style="margin-right: 40px">Prefer Professor</button>
        <button @click="badProfs.push(curProf)" style="margin-right: 40px">Avoid Professor</button>
        <select v-model="curProf">
          <option v-for="prof in allProfs" :key="prof">
            {{prof}}
          </option>
        </select>
      </div>
  </div>

  <div class="generate-region">
    <button class="generate-button" @click="generateClasses()"> Generate Class Recomendations </button>
    <div class="loader" id="loader" style="display: none"/>
  </div>

  <!--Output-->
  <div class="generate-output" v-if="outputClassList.length">
    <span>
      Recommended Classes:
    </span>
    <div v-for="output in outputClassList" :key="output.name" class="output-each">
      {{formatOutput(output)}}
    </div>
  </div>
</div>
</template>

<script>
export default {

  data(){
    return{
      coursesOpen: false,
      preferencesOpen: false,
      professorOpen: false,

      studentCourses: [],
      allCourses: [],

      timeRestrictions: [],
      curStartTime: '8 AM',
      curEndTime: '10 AM',
      curWeekday: 'Everyday',

      allProfs: [],
      goodProfs: [],
      badProfs: [],
      curProf: 'Smallberg, D.A.',

      fullClassInfo: [],
      outputClassList: [],
    }
  },

  mounted(){
    let data = {'all_classes': ['COM SCI 1', 'COM SCI 19', 'COM SCI 30', 'COM SCI 31', 'COM SCI 32', 'COM SCI 33', 'COM SCI 35L', 'COM SCI M51A', 'COM SCI 88SA', 'COM SCI 88SB', 'COM SCI 88SC', 'COM SCI 97', 'COM SCI 99', 'COM SCI 111', 'COM SCI 112', 'COM SCI 117', 'COM SCI 118', 'COM SCI M119', 'COM SCI CM121', 'COM SCI CM122', 'COM SCI CM124', 'COM SCI 130', 'COM SCI 131', 'COM SCI 132', 'COM SCI 133', 'COM SCI 134', 'COM SCI 136', 'COM SCI C137A', 'COM SCI C137B', 'COM SCI 143', 'COM SCI 144', 'COM SCI 145', 'COM SCI M146', 'COM SCI M146', 'COM SCI M148', 'COM SCI M151B', 'COM SCI M152A', 'COM SCI 152B', 'COM SCI 161', 'COM SCI 168', 'COM SCI 170A', 'COM SCI M171L', 'COM SCI 172', 'COM SCI 174A', 'COM SCI 174B', 'COM SCI C174C', 'COM SCI 180', 'COM SCI 181', 'COM SCI M182', 'COM SCI 183', 'COM SCI M184', 'COM SCI CM186', 'COM SCI CM187', 'COM SCI 188', 'COM SCI 188SA', 'COM SCI 188SB', 'COM SCI 188SC', 'COM SCI 192', 'COM SCI M192A', 'COM SCI 194', 'COM SCI 199', 'COM SCI 201', 'COM SCI 202', 'COM SCI 205', 'COM SCI 211', 'COM SCI 212A', 'COM SCI M213A', 'COM SCI M213B', 'COM SCI 214', 'COM SCI 216', 'COM SCI 217A', 'COM SCI 217B', 'COM SCI 218', 'COM SCI 219', 'COM SCI CM221', 'COM SCI CM222', 'COM SCI CM224', 'COM SCI M225', 'COM SCI M226', 'COM SCI M229S', 'COM SCI 230', 'COM SCI 231', 'COM SCI 232', 'COM SCI 233A', 'COM SCI 233B', 'COM SCI 234', 'COM SCI 235', 'COM SCI 236', 'COM SCI C237A', 'COM SCI C237B', 'COM SCI 238', 'COM SCI 239', 'COM SCI 240A', 'COM SCI 240B', 'COM SCI 241B', 'COM SCI 244A', 'COM SCI 245', 'COM SCI 246', 'COM SCI 247', 'COM SCI 249', 'COM SCI 251A', 'COM SCI 251B', 'COM SCI 252A', 'COM SCI 256A', 'COM SCI M258A', 'COM SCI M258C', 'COM SCI 258F', 'COM SCI 258G', 'COM SCI 258H', 'COM SCI 259', 'COM SCI 260', 'COM SCI 260B', 'COM SCI 260C', 'COM SCI 261A', 'COM SCI 262A', 'COM SCI M262C', 'COM SCI 262Z', 'COM SCI 263', 'COM SCI 263', 'COM SCI 263A', 'COM SCI 263C', 'COM SCI 264A', 'COM SCI 265A', 'COM SCI M266A', 'COM SCI M266B', 'COM SCI 267A', 'COM SCI 267A', 'COM SCI M268', 'COM SCI 268S', 'COM SCI 269', 'COM SCI C274C', 'COM SCI 275', 'COM SCI M276A', 'COM SCI 280A', 'COM SCI 280AP', 'COM SCI 280CO', 'COM SCI 280D', 'COM SCI 280DA', 'COM SCI 280DP', 'COM SCI 280G', 'COM SCI 280P', 'COM SCI 281A', 'COM SCI M282A', 'COM SCI M282B', 'COM SCI M283A', 'COM SCI M283B', 'COM SCI 284A', 'COM SCI 284C', 'COM SCI 284P', 'COM SCI 285CC', 'COM SCI CM286', 'COM SCI CM287', 'COM SCI 288S', 'COM SCI 289A', 'COM SCI 289CO', 'COM SCI 289L', 'COM SCI 289OA', 'COM SCI 289P', 'COM SCI 289RA', 'COM SCI 289SG', 'COM SCI M296A', 'COM SCI M296B', 'COM SCI M296C', 'COM SCI M296D', 'COM SCI 298', 'COM SCI 375', 'COM SCI 495', 'COM SCI 495B', 'COM SCI 497D', 'COM SCI 497E', 'COM SCI 596', 'COM SCI 597A', 'COM SCI 597B', 'COM SCI 597C', 'COM SCI 598', 'COM SCI 599'], 'all_profs': ['Smallberg, D.A.', 'Reinman, G.D.', 'Eggert, P.R.', 'He, L.', 'Blend, M.L.', 'Zheng, H.', 'Reiher, P.L.', 'Lu, S.', 'Zhao, J.', 'Tan, Z.', 'Burns, M.S.', 'Xiao, P.', 'Gong, R.', 'Cong, J.J.', 'Marrett, K.', 'Tan, D.', 'Rosario, R.R.', 'Davis, T.A.', 'Jiang, S.', 'Cheng, K.', 'Wang, W.', 'Qin, Z.', 'Diggavi, S.N.', 'Grover, A.', 'Dolecek, L.', 'Tamir, Y.', 'Wu, C.', 'Ershadi, G.', 'Darwiche, A.Y.', 'Terzopoulos, D.', 'Lu, W.', 'Sarrafzadeh, M.', 'Sherstov, A.', 'Ostrovsky, R.', 'Distefano, J.', 'Zheng, D.H.', 'Pellegrini, M.', 'Gu, Q.', 'Varghese, G.', 'Zhang, L.', 'Abari, O.', 'Sankararaman, S.', 'Kim, M.', 'Xu, H.', 'Palsberg, J.', 'Sun, Y.', 'Nowatzki, A.J.', 'Meka, R.', 'Chang, K.', 'Van den Broeck, G.', 'Khosravi, P.', 'Hsieh, C.', 'Zhou, B.', 'Mirzasoleiman, B.', 'Peng, N.', 'Sahai, A.'], 'required_classes': ['COM SCI 1', 'COM SCI 31', 'COM SCI 32', 'COM SCI 35L', 'COM SCI M51A', 'COM SCI 111', 'COM SCI 118', 'COM SCI 131', 'COM SCI M151B', 'COM SCI M152A', 'COM SCI 180', 'COM SCI 181', 'COM SCI 130'], 'class_prerequisites': {'COM SCI 1': [], 'COM SCI 19': [], 'COM SCI 30': [], 'COM SCI 31': [], 'COM SCI 32': ['COM SCI 31'], 'COM SCI 33': ['COM SCI 32'], 'COM SCI 35L': ['COM SCI 31'], 'COM SCI M51A': [], 'COM SCI 88SA': [], 'COM SCI 88SB': [], 'COM SCI 88SC': [], 'COM SCI 97': [], 'COM SCI 99': [], 'COM SCI 111': ['COM SCI 32', 'COM SCI 33', 'COM SCI 35L'], 'COM SCI 112': ['COM SCI 111', 'COM SCI 110', 'COM SCI 131A', 'COM SCI 170A', 'COM SCI 100A'], 'COM SCI 117': [], 'COM SCI 118': ['COM SCI 111'], 'COM SCI M119': ['COM SCI 33;', 'COM SCI 118', 'COM SCI 132B;', 'COM SCI 110', 'COM SCI 131A', 'COM SCI 170A', 'COM SCI 170E', 'COM SCI 100A'], 'COM SCI CM121': ['COM SCI 32', 'COM SCI 10C', 'COM SCI 110', 'COM SCI 131A', 'COM SCI 170A', 'COM SCI 170E', 'COM SCI 100A'], 'COM SCI CM122': ['COM SCI 32', 'COM SCI 10C', 'COM SCI 110', 'COM SCI 131A', 'COM SCI 170A', 'COM SCI 170E', 'COM SCI 100A'], 'COM SCI CM124': ['COM SCI 32', 'COM SCI 10C', 'COM SCI 33A', 'COM SCI 110', 'COM SCI 131A', 'COM SCI 170A', 'COM SCI 170E', 'COM SCI 100A'], 'COM SCI 130': ['COM SCI 111', 'COM SCI 131'], 'COM SCI 131': ['COM SCI 33', 'COM SCI 35L'], 'COM SCI 132': ['COM SCI 131'], 'COM SCI 133': ['COM SCI 131', 'COM SCI M151B'], 'COM SCI 134': ['COM SCI 118'], 'COM SCI 136': ['COM SCI 118'], 'COM SCI C137A': ['COM SCI 131'], 'COM SCI C137B': ['COM SCI C137A'], 'COM SCI 143': ['COM SCI 32', 'COM SCI 10C'], 'COM SCI 144': ['COM SCI 143'], 'COM SCI 145': ['COM SCI 143'], 'COM SCI M146': ['COM SCI 32', 'COM SCI 10C;', 'COM SCI 110', 'COM SCI 131A', 'COM SCI 170A', 'COM SCI 170E', 'COM SCI 100A;', 'COM SCI 33A'], 'COM SCI M148': ['COM SCI 31', 'COM SCI 10A', 'COM SCI 10B', 'COM SCI 110', 'COM SCI 131A', 'COM SCI 170A', 'COM SCI 170E', 'COM SCI 100A'], 'COM SCI M151B': ['COM SCI 33', 'COM SCI M51A', 'COM SCI M16'], 'COM SCI M152A': ['COM SCI M51A', 'COM SCI M16'], 'COM SCI 152B': ['COM SCI M151B', 'COM SCI M116C'], 'COM SCI 161': ['COM SCI 180'], 'COM SCI 168': ['COM SCI 32', 'COM SCI 10C', 'COM SCI 33A', 'COM SCI 110', 'COM SCI 131A', 'COM SCI 170A', 'COM SCI 170E', 'COM SCI 100A'], 'COM SCI 170A': ['COM SCI 180', 'COM SCI 33B'], 'COM SCI M171L': [], 'COM SCI 172': ['COM SCI 32'], 'COM SCI 174A': ['COM SCI 32'], 'COM SCI 174B': ['COM SCI 174A'], 'COM SCI C174C': ['COM SCI 174A'], 'COM SCI 180': ['COM SCI 32', 'COM SCI 61'], 'COM SCI 181': ['COM SCI 180'], 'COM SCI M182': [], 'COM SCI 183': ['COM SCI 180'], 'COM SCI M184': ['COM SCI 31', 'COM SCI M20', 'COM SCI M20', 'COM SCI 10A;', 'COM SCI 30B', 'COM SCI 3B', 'COM SCI 31B'], 'COM SCI CM186': [], 'COM SCI CM187': ['COM SCI M182', 'COM SCI CM186', 'COM SCI M150;', 'COM SCI 199', 'COM SCI 199', 'COM SCI 199'], 'COM SCI 188': [], 'COM SCI 188SA': [], 'COM SCI 188SB': ['COM SCI 188SA'], 'COM SCI 188SC': ['COM SCI 188SB'], 'COM SCI 192': ['COM SCI 192A', 'COM SCI 192A'], 'COM SCI M192A': [], 'COM SCI 194': [], 'COM SCI 199': [], 'COM SCI 201': [], 'COM SCI 202': [], 'COM SCI 205': ['COM SCI 31', 'COM SCI 180'], 'COM SCI 211': ['COM SCI 118'], 'COM SCI 212A': ['COM SCI 112', 'COM SCI 131A'], 'COM SCI M213A': ['COM SCI 111'], 'COM SCI M213B': ['COM SCI M51A', 'COM SCI M16'], 'COM SCI 214': ['COM SCI 111'], 'COM SCI 216': ['COM SCI 211'], 'COM SCI 217A': ['COM SCI 118'], 'COM SCI 217B': ['COM SCI 217A'], 'COM SCI 218': ['COM SCI 112', 'COM SCI 118'], 'COM SCI 219': [], 'COM SCI CM221': ['COM SCI 32', 'COM SCI 10C', 'COM SCI 110', 'COM SCI 131A', 'COM SCI 170A', 'COM SCI 170E', 'COM SCI 100A'], 'COM SCI CM222': ['COM SCI 32', 'COM SCI 10C', 'COM SCI 110', 'COM SCI 131A', 'COM SCI 170A', 'COM SCI 170E', 'COM SCI 100A'], 'COM SCI CM224': ['COM SCI 32', 'COM SCI 10C', 'COM SCI 33A', 'COM SCI 110', 'COM SCI 131A', 'COM SCI 170A', 'COM SCI 170E', 'COM SCI 100A'], 'COM SCI M225': [], 'COM SCI M226': ['COM SCI 32', 'COM SCI 10C'], 'COM SCI M229S': [], 'COM SCI 230': [], 'COM SCI 231': ['COM SCI 131'], 'COM SCI 232': ['COM SCI 132'], 'COM SCI 233A': ['COM SCI 111', 'COM SCI 131'], 'COM SCI 233B': ['COM SCI 233A'], 'COM SCI 234': ['COM SCI 181'], 'COM SCI 235': ['COM SCI 111'], 'COM SCI 236': ['COM SCI 111', 'COM SCI 118'], 'COM SCI C237A': ['COM SCI 131'], 'COM SCI C237B': ['COM SCI C237A'], 'COM SCI 238': [], 'COM SCI 239': [], 'COM SCI 240A': ['COM SCI 143'], 'COM SCI 240B': ['COM SCI 143', 'COM SCI 240A'], 'COM SCI 241B': ['COM SCI 143'], 'COM SCI 244A': [], 'COM SCI 245': ['COM SCI 143', 'COM SCI 180'], 'COM SCI 246': ['COM SCI 112', 'COM SCI 143', 'COM SCI 180', 'COM SCI 181'], 'COM SCI 247': ['COM SCI 145', 'COM SCI M146'], 'COM SCI 249': [], 'COM SCI 251A': ['COM SCI M151B'], 'COM SCI 251B': ['COM SCI M151B'], 'COM SCI 252A': ['COM SCI 251A'], 'COM SCI 256A': ['COM SCI M151B'], 'COM SCI M258A': ['COM SCI M51A', 'COM SCI M16', 'COM SCI 115A'], 'COM SCI M258C': ['COM SCI M258A'], 'COM SCI 258F': [], 'COM SCI 258G': ['COM SCI M51A', 'COM SCI 180'], 'COM SCI 258H': ['COM SCI M258A', 'COM SCI 258F'], 'COM SCI 259': [], 'COM SCI 260': ['COM SCI 180'], 'COM SCI 260B': [], 'COM SCI 260C': ['COM SCI 180', 'COM SCI 260'], 'COM SCI 261A': ['COM SCI 180'], 'COM SCI 262A': ['COM SCI 112', 'COM SCI 131A'], 'COM SCI M262C': ['COM SCI 262A', 'COM SCI 200B', 'COM SCI 202B'], 'COM SCI 262Z': ['COM SCI 262A'], 'COM SCI 263': [], 'COM SCI 263A': ['COM SCI 130', 'COM SCI 131', 'COM SCI 161'], 'COM SCI 263C': ['COM SCI 130', 'COM SCI 131', 'COM SCI 161'], 'COM SCI 264A': ['COM SCI 161'], 'COM SCI 265A': ['COM SCI 263A', 'COM SCI 264A'], 'COM SCI M266A': [], 'COM SCI M266B': [], 'COM SCI 267A': [], 'COM SCI M268': [], 'COM SCI 268S': [], 'COM SCI 269': [], 'COM SCI C274C': ['COM SCI 174A'], 'COM SCI 275': ['COM SCI 174A'], 'COM SCI M276A': [], 'COM SCI 280A': ['COM SCI 180'], 'COM SCI 280AP': ['COM SCI 180'], 'COM SCI 280CO': ['COM SCI 180'], 'COM SCI 280D': ['COM SCI 180'], 'COM SCI 280DA': ['COM SCI 180'], 'COM SCI 280DP': ['COM SCI 180'], 'COM SCI 280G': ['COM SCI 180'], 'COM SCI 280P': ['COM SCI 180'], 'COM SCI 281A': ['COM SCI 181'], 'COM SCI M282A': [], 'COM SCI M282B': ['COM SCI M282A'], 'COM SCI M283A': [], 'COM SCI M283B': [], 'COM SCI 284A': ['COM SCI 181'], 'COM SCI 284C': ['COM SCI 181'], 
    'COM SCI 284P': ['COM SCI 181'], 'COM SCI 285CC': [], 'COM SCI CM286': [], 'COM SCI CM287': ['COM SCI M182', 'COM SCI CM286', 'COM SCI M150;', 'COM SCI 199', 'COM SCI 199', 'COM SCI 199'], 'COM SCI 288S': ['COM SCI 280A', 'COM SCI 281A'], 'COM SCI 289A': [], 'COM SCI 289CO': [], 'COM SCI 289L': [], 'COM SCI 289OA': ['COM SCI 180'], 'COM SCI 289P': [], 'COM SCI 289RA': [], 'COM SCI 289SG': [], 'COM SCI M296A': [], 'COM SCI M296B': ['COM SCI CM286', 'COM SCI M296A', 'COM SCI 220'], 'COM SCI M296C': ['COM SCI M296B'], 'COM SCI M296D': ['COM SCI CM186'], 'COM SCI 298': [], 'COM SCI 375': [], 'COM SCI 495': [], 'COM SCI 495B': [], 'COM SCI 497D': [], 'COM SCI 497E': [], 'COM SCI 596': [], 'COM SCI 597A': [], 'COM SCI 597B': [], 'COM SCI 597C': [], 'COM SCI 598': [], 'COM SCI 599': []}, 'class_info': {'COM SCI 31': {'lecture_sections': {'187093200_COMSCI0031': {'discussion_sections': {'187093201_187093200_COMSCI0031': {'discussion_timing': [['Friday', '12pm', '1:50pm']], 'sectionName': 'Computer Science (COM SCI) 31 - Introduction to Computer Science I Dis 1A'}, '187093202_187093200_COMSCI0031': {'discussion_timing': [['Friday', '12pm', '1:50pm']], 'sectionName': 'Computer Science (COM SCI) 31 - Introduction to Computer Science I Dis 1B'}, '187093203_187093200_COMSCI0031': {'discussion_timing': [['Friday', '12pm', '1:50pm']], 'sectionName': 'Computer Science (COM SCI) 31 - Introduction to Computer Science I Dis 1C'}, '187093204_187093200_COMSCI0031': {'discussion_timing': [['Friday', '2pm', '3:50pm']], 'sectionName': 'Computer Science (COM SCI) 31 - Introduction to Computer Science I Dis 1D'}, '187093205_187093200_COMSCI0031': {'discussion_timing': [['Friday', '2pm', '3:50pm']], 'sectionName': 'Computer Science (COM SCI) 31 - Introduction to Computer Science I Dis 1E'}, '187093206_187093200_COMSCI0031': {'discussion_timing': [['Friday', '2pm', '3:50pm']], 'sectionName': 'Computer Science (COM SCI) 31 - Introduction to Computer Science I Dis 1F'}, '187093207_187093200_COMSCI0031': {'discussion_timing': [['Friday', '4pm', '5:50pm']], 'sectionName': 'Computer Science (COM SCI) 31 - Introduction to Computer Science I Dis 1G'}}, 'lecture_timing': [['Monday', '4pm', '5:50pm'], ['Wednesday', '4pm', '5:50pm']], 'lecture_names': 'Computer Science (COM SCI) 31 - Introduction to Computer Science I Lec 1'}, 'instructor': 'Smallberg, D.A.'}, 'units': 4}, 'COM SCI 32': {'lecture_sections': {'187096200_COMSCI0032': {'discussion_sections': {'187096201_187096200_COMSCI0032': {'discussion_timing': [['Friday', '10am', '11:50am']], 'sectionName': 'Computer Science (COM SCI) 32 - Introduction to Computer Science II Dis 1A'}, '187096202_187096200_COMSCI0032': {'discussion_timing': [['Friday', '10am', '11:50am']], 'sectionName': 'Computer Science (COM SCI) 32 - Introduction to Computer Science II Dis 1B'}, '187096203_187096200_COMSCI0032': {'discussion_timing': [['Friday', '12pm', '1:50pm']], 'sectionName': 'Computer Science (COM SCI) 32 - Introduction to Computer Science II Dis 1C'}, '187096204_187096200_COMSCI0032': {'discussion_timing': [['Friday', '12pm', '1:50pm']], 'sectionName': 'Computer Science (COM SCI) 32 - Introduction to Computer Science II Dis 1D'}, '187096205_187096200_COMSCI0032': {'discussion_timing': [['Friday', '12pm', '1:50pm']], 'sectionName': 'Computer Science (COM SCI) 32 - Introduction to Computer Science II Dis 1E'}, '187096206_187096200_COMSCI0032': {'discussion_timing': [['Friday', '12pm', '1:50pm']], 'sectionName': 'Computer Science (COM SCI) 32 - Introduction to Computer Science II Dis 1F'}, '187096207_187096200_COMSCI0032': {'discussion_timing': [['Friday', '12pm', '1:50pm']], 'sectionName': 'Computer Science (COM SCI) 32 - Introduction to Computer Science II Dis 1G'}, '187096208_187096200_COMSCI0032': {'discussion_timing': [['Friday', '12pm', '1:50pm']], 'sectionName': 'Computer Science (COM SCI) 32 - Introduction to Computer Science II Dis 1H'}}, 'lecture_timing': [['Monday', '6pm', '7:50pm'], ['Wednesday', '6pm', '7:50pm']], 'lecture_names': 'Computer Science (COM SCI) 32 - Introduction to Computer Science II Lec 1'}, 'instructor': 'Smallberg, D.A.'}, 'units': 4}, 'COM SCI 33': {'lecture_sections': {'187101200_COMSCI0033': {'discussion_sections': {'187101201_187101200_COMSCI0033': {'discussion_timing': [['Friday', '10am', '11:50am']], 'sectionName': 'Computer Science (COM SCI) 33 - Introduction to Computer Organization Dis 1A'}, '187101202_187101200_COMSCI0033': {'discussion_timing': [['Friday', '10am', '11:50am']], 'sectionName': 'Computer Science (COM SCI) 33 - Introduction to Computer Organization Dis 1B'}, '187101203_187101200_COMSCI0033': {'discussion_timing': [['Friday', '12pm', '1:50pm']], 'sectionName': 'Computer Science (COM SCI) 33 - Introduction to Computer Organization Dis 1C'}, '187101204_187101200_COMSCI0033': {'discussion_timing': [['Friday', '12pm', '1:50pm']], 'sectionName': 'Computer Science (COM SCI) 33 - Introduction to Computer Organization Dis 1D'}, '187101205_187101200_COMSCI0033': {'discussion_timing': [['Friday', '2pm', '3:50pm']], 'sectionName': 'Computer Science (COM SCI) 33 - Introduction to Computer Organization Dis 1E'}, '187101206_187101200_COMSCI0033': {'discussion_timing': [['Friday', '2pm', '3:50pm']], 'sectionName': 'Computer Science (COM SCI) 33 - Introduction to Computer Organization Dis 1F'}, '187101207_187101200_COMSCI0033': {'discussion_timing': [['Friday', '4pm', '5:50pm']], 'sectionName': 'Computer Science (COM SCI) 33 - Introduction to Computer Organization Dis 1G'}, '187101208_187101200_COMSCI0033': {'discussion_timing': [['Friday', '4pm', '5:50pm']], 'sectionName': 'Computer Science (COM SCI) 33 - Introduction to Computer Organization Dis 1H'}}, 'lecture_timing': [['Monday', '10am', '11:50am'], ['Wednesday', '10am', '11:50am']], 'lecture_names': 'Computer Science (COM SCI) 33 - Introduction to Computer Organization Lec 1'}, 'instructor': 'Reinman, G.D.'}, 'units': 5}, 'COM SCI 35L': {'lecture_sections': {'187105200_COMSCI0035L': {'discussion_sections': {'187105201_187105200_COMSCI0035L': {'discussion_timing': [['Friday', '10am', '11:50am']], 'sectionName': 'Computer Science (COM SCI) 35L - Software Construction Dis 1A'}, '187105202_187105200_COMSCI0035L': {'discussion_timing': [['Friday', '10am', '11:50am']], 'sectionName': 'Computer Science (COM SCI) 35L - Software Construction Dis 1B'}, '187105203_187105200_COMSCI0035L': {'discussion_timing': [['Friday', '12pm', '1:50pm']], 'sectionName': 'Computer Science (COM SCI) 35L - Software Construction Dis 1C'}, '187105104_187105200_COMSCI0035L': {'discussion_timing': [['Friday', '2pm', '3:50pm']], 'sectionName': 'Computer Science (COM SCI) 35L - Software Construction Dis 1D'}, '187105205_187105200_COMSCI0035L': {'discussion_timing': [['Friday', '2pm', '3:50pm']], 'sectionName': 'Computer Science (COM SCI) 35L - Software Construction Dis 1E'}}, 'lecture_timing': [['Monday', '2pm', '3:50pm'], ['Wednesday', '2pm', '3:50pm']], 'lecture_names': 'Computer Science (COM SCI) 35L - Software Construction Lec 1'}, 'instructor': 'Eggert, P.R.'}, 'units': 4}, 'COM SCI M51A': {'lecture_sections': {'187154200_COMSCI0051AM': {'discussion_sections': {'187154201_187154200_COMSCI0051AM': {'discussion_timing': [['Friday', '4pm', '4:50pm']], 'sectionName': 'Computer Science (COM SCI) M51A - Logic Design of Digital Systems Dis 1A'}, '187154202_187154200_COMSCI0051AM': {'discussion_timing': [['Thursday', '4pm', '5:50pm']], 'sectionName': 'Computer Science (COM SCI) M51A - Logic Design of Digital Systems Dis 1B'}, '187154203_187154200_COMSCI0051AM': {'discussion_timing': [['Friday', '10am', '11:50am']], 'sectionName': 'Computer Science (COM SCI) M51A - Logic Design of Digital Systems Dis 1C'}, '187154204_187154200_COMSCI0051AM': {'discussion_timing': [['Friday', '12pm', '1:50pm']], 'sectionName': 'Computer Science (COM SCI) M51A - Logic Design of Digital Systems Dis 1D'}}, 'lecture_timing': [['Monday', '4pm', '5:50pm'], ['Wednesday', '4pm', '5:50pm']], 'lecture_names': 'Computer Science (COM SCI) M51A - Logic Design of Digital Systems Lec 1'}, 'instructor': 'He, L.'}, 'units': 4}, 'COM SCI 88SA': {'lecture_sections': {'187275200_COMSCI0088SA': {'discussion_sections': {}, 'lecture_timing': [['Thursday', '4pm', '4:50pm']], 'lecture_names': 'Computer Science (COM SCI) 88SA - Machine Learning 101 Sem 1'}, 'instructor': 'None'}, 'units': 1}, 'COM SCI 88SB': {'lecture_sections': {'187276200_COMSCI0088SB': {'discussion_sections': {}, 'lecture_timing': [['Tuesday', '10am', '10:50am']], 'lecture_names': 'Computer Science (COM SCI) 88SB - Demystifying Computer Science Sem 1'}, 'instructor': 'None'}, 'units': 1}, 'COM SCI 88SC': {'lecture_sections': {'187277200_COMSCI0088SC': {'discussion_sections': {}, 'lecture_timing': [['Monday', '4pm', '4:50pm']], 'lecture_names': 'Computer Science (COM SCI) 88SC - Technology of X-Files: Aliens and Paranormal Sem 1'}, 'instructor': 'None'}, 'units': 1}, 'COM SCI 97001': {'lecture_sections': {'187291200_COMSCI0097001': {'discussion_sections': {'187291201_187291200_COMSCI0097001': {'discussion_timing': [['Friday', '12pm', '1:50pm']], 'sectionName': 'Computer Science (COM SCI) 97 - Variable Topics in Computer Science: Launch: Turn Idea into Company Dis 1A'}}, 'lecture_timing': [['Monday', '10am', '11:50am'], ['Wednesday', '10am', '11:50am']], 'lecture_names': 'Computer Science (COM SCI) 97 - Variable Topics in Computer Science: Launch: Turn Idea into Company Lec 1'}, 'instructor': 'Blend, M.L.'}, 'units': 1}, 'COM SCI 111': {'lecture_sections': {'187336200_COMSCI0111': {'discussion_sections': {'187336201_187336200_COMSCI0111': {'discussion_timing': [['Friday', '10am', '11:50am']], 'sectionName': 'Computer Science (COM SCI) 111 - Operating Systems Principles Lab 1A'}, '187336202_187336200_COMSCI0111': {'discussion_timing': [['Friday', '12pm', '1:50pm']], 'sectionName': 'Computer Science (COM SCI) 111 - Operating Systems Principles Lab 1B'}}, 'lecture_timing': [['Tuesday', '8am', '9:50am'], 
    ['Thursday', '8am', '9:50am']], 'lecture_names': 'Computer Science (COM SCI) 111 - Operating Systems Principles Lec 1'}, 'instructor': 'Reiher, P.L.'}, 'units': 5}, 'COM SCI 118': 'None', 'COM SCI 130': {'lecture_sections': {'187500200_COMSCI0130': {'discussion_sections': {'187500201_187500200_COMSCI0130': {'discussion_timing': [['Friday', '12pm', '1:50pm']], 'sectionName': 'Computer Science (COM SCI) 130 - Software Engineering Lab 1A'}, '187500202_187500200_COMSCI0130': {'discussion_timing': [['Friday', '2pm', '3:50pm']], 'sectionName': 'Computer Science (COM SCI) 130 - Software Engineering Lab 1B'}}, 'lecture_timing': [['Tuesday', '4pm', '5:50pm'], ['Thursday', '4pm', '5:50pm']], 'lecture_names': 'Computer Science (COM SCI) 130 - Software Engineering Lec 1'}, 'instructor': 'Burns, M.S.'}, 'units': 4}, 'COM SCI 131': {'lecture_sections': {'187510200_COMSCI0131': {'discussion_sections': {'187510201_187510200_COMSCI0131': {'discussion_timing': [['Friday', '10am', '11:50am']], 'sectionName': 'Computer Science (COM SCI) 131 - Programming Languages Lab 1A'}, '187510202_187510200_COMSCI0131': {'discussion_timing': [['Friday', '12pm', '1:50pm']], 'sectionName': 'Computer Science (COM SCI) 131 - Programming Languages Lab 1B'}, '187510203_187510200_COMSCI0131': {'discussion_timing': [['Friday', '2pm', '3:50pm']], 'sectionName': 'Computer Science (COM SCI) 131 - Programming Languages Lab 1C'}, '187510204_187510200_COMSCI0131': {'discussion_timing': [['Friday', '2pm', '3:50pm']], 'sectionName': 'Computer Science (COM SCI) 131 - Programming Languages Lab 1D'}}, 'lecture_timing': [['Tuesday', '10am', '11:50am'], ['Thursday', '10am', '11:50am']], 'lecture_names': 'Computer Science (COM SCI) 131 - Programming Languages Lec 1'}, 'instructor': 'Eggert, P.R.'}, 'units': 4}, 'COM SCI 133': {'lecture_sections': {'187549200_COMSCI0133': {'discussion_sections': {'187549201_187549200_COMSCI0133': {'discussion_timing': [['Friday', '10am', '11:50am']], 'sectionName': 'Computer Science (COM SCI) 133 - Parallel and Distributed Computing Dis 1A'}, '187549202_187549200_COMSCI0133': {'discussion_timing': [['Friday', '2pm', '3:50pm']], 'sectionName': 'Computer Science (COM SCI) 133 - Parallel and Distributed Computing Dis 1B'}}, 'lecture_timing': [['Monday', '4pm', '5:50pm'], ['Wednesday', '4pm', '5:50pm']], 'lecture_names': 'Computer Science (COM SCI) 133 - Parallel and Distributed Computing Lec 1'}, 'instructor': 'Cong, J.J.'}, 'units': 4}, 'COM SCI 143': {'lecture_sections': {'187590200_COMSCI0143': {'discussion_sections': {'187590201_187590200_COMSCI0143': {'discussion_timing': [['Friday', '10am', '11:50am']], 'sectionName': 'Computer Science (COM SCI) 143 - Data Management Systems Lab 1A'}, '187590202_187590200_COMSCI0143': {'discussion_timing': [['Friday', '12pm', '1:50pm']], 'sectionName': 'Computer Science (COM SCI) 143 - Data Management Systems Lab 1B'}, '187590203_187590200_COMSCI0143': {'discussion_timing': [['Friday', '2pm', '3:50pm']], 'sectionName': 'Computer Science (COM SCI) 143 - Data Management Systems Lab 1C'}}, 'lecture_timing': [['Monday', '4pm', '5:50pm'], ['Wednesday', '4pm', '5:50pm']], 'lecture_names': 'Computer Science (COM SCI) 143 - Data Management Systems Lec 1'}, 'instructor': 'Rosario, R.R.'}, 'units': 4}, 'COM SCI 145': {'lecture_sections': {'187570200_COMSCI0145': {'discussion_sections': {'187570201_187570200_COMSCI0145': {'discussion_timing': [['Friday', '2pm', '3:50pm']], 'sectionName': 'Computer Science (COM SCI) 145 - Introduction to Data Mining Dis 1A'}}, 'lecture_timing': [['Monday', '2pm', '3:50pm'], ['Wednesday', '2pm', '3:50pm']], 'lecture_names': 'Computer Science (COM SCI) 145 - Introduction to Data Mining Lec 1'}, 'instructor': 'Wang, W.'}, 'units': 4}, 'COM SCI M146': {'lecture_sections': {'187576200_COMSCI0146M': {'discussion_sections': {'187576201_187576200_COMSCI0146M': {'discussion_timing': [['Friday', '10am', '10:50am']], 'sectionName': 'Computer Science (COM SCI) M146 - Introduction to Machine Learning Dis 1A'}, '187576202_187576200_COMSCI0146M': {'discussion_timing': [['Friday', '11am', '11:50am']], 'sectionName': 'Computer Science (COM SCI) M146 - Introduction to Machine Learning Dis 1B'}}, 'lecture_timing': [['Monday', '10am', '11:50am'], ['Wednesday', '10am', '11:50am']], 'lecture_names': 'Computer Science (COM SCI) M146 - Introduction to Machine Learning Lec 1'}, 'instructor': 'Grover, A.', '187576210_COMSCI0146M': {'discussion_sections': {'187576211_187576210_COMSCI0146M': {'discussion_timing': [['Friday', '10am', '10:50am']], 'sectionName': 'Computer Science (COM SCI) M146 - Introduction to Machine Learning Dis 2A'}, '187576212_187576210_COMSCI0146M': {'discussion_timing': [['Friday', '12pm', '12:50pm']], 'sectionName': 'Computer Science (COM SCI) M146 - Introduction to Machine Learning Dis 2B'}}, 'lecture_timing': [['Tuesday', '2pm', '3:50pm'], ['Thursday', '2pm', '3:50pm']], 'lecture_names': 'Computer Science (COM SCI) M146 - Introduction to Machine Learning Lec 2'}}, 'units': 4}, 'COM SCI M148': {'lecture_sections': {'187588200_COMSCI0148M': {'discussion_sections': {'187588201_187588200_COMSCI0148M': {'discussion_timing': [['Friday', '10am', '10:50am']], 'sectionName': 'Computer Science (COM SCI) M148 - Introduction to Data Science Dis 1A'}, '187588202_187588200_COMSCI0148M': {'discussion_timing': [['Friday', '11am', '11:50am']], 'sectionName': 'Computer Science (COM SCI) M148 - Introduction to Data Science Dis 1B'}, '187588203_187588200_COMSCI0148M': {'discussion_timing': [['Friday', '12pm', '12:50pm']], 'sectionName': 'Computer Science (COM SCI) M148 - Introduction to Data Science Dis 1C'}, '187588204_187588200_COMSCI0148M': {'discussion_timing': [['Friday', '1pm', '1:50pm']], 'sectionName': 'Computer Science (COM SCI) M148 - Introduction to Data Science Dis 1D'}, '187588205_187588200_COMSCI0148M': {'discussion_timing': [['Friday', '2pm', '2:50pm']], 'sectionName': 'Computer Science (COM SCI) M148 - Introduction to Data Science Dis 1E'}, '187588206_187588200_COMSCI0148M': {'discussion_timing': [['Friday', '3pm', '3:50pm']], 'sectionName': 'Computer Science (COM SCI) M148 - Introduction to Data Science Dis 1F'}}, 'lecture_timing': [['Tuesday', '10am', '11:50am'], ['Thursday', '10am', '11:50am']], 'lecture_names': 'Computer Science (COM SCI) M148 - Introduction to Data Science Lec 1'}, 'instructor': 'Dolecek, L.'}, 'units': 4}, 'COM SCI M151B': {'lecture_sections': {'187650200_COMSCI0151BM': {'discussion_sections': {'187650201_187650200_COMSCI0151BM': {'discussion_timing': [['Friday', '10am', '11:50am']], 'sectionName': 'Computer Science (COM SCI) M151B - Computer Systems Architecture Dis 1A'}, '187650202_187650200_COMSCI0151BM': {'discussion_timing': [['Friday', '10am', '11:50am']], 'sectionName': 'Computer Science (COM SCI) M151B - Computer Systems Architecture Dis 1B'}}, 'lecture_timing': [['Monday', '10am', '11:50am'], ['Wednesday', '10am', '11:50am']], 'lecture_names': 'Computer Science (COM SCI) M151B - Computer Systems Architecture Lec 1'}, 'instructor': 'Tamir, Y.'}, 'units': 4}, 'COM SCI M152A': {'lecture_sections': {'187686201_COMSCI0152AM': {'discussion_sections': {}, 'lecture_timing': [['Monday', '10am', '11:50am'], ['Wednesday', '10am', '11:50am']], 'lecture_names': 'Computer Science (COM SCI) M152A - Introductory Digital Design Laboratory Lab 1'}, 'instructor': 'None', '187686202_COMSCI0152AM': {'discussion_sections': {}, 'lecture_timing': [['Monday', '12pm', '1:50pm'], ['Wednesday', '12pm', '1:50pm']], 'lecture_names': 'Computer Science (COM SCI) M152A - Introductory Digital Design Laboratory Lab 2'}, '187686203_COMSCI0152AM': {'discussion_sections': {}, 'lecture_timing': [['Monday', '2pm', '3:50pm'], ['Wednesday', '2pm', '3:50pm']], 'lecture_names': 'Computer Science (COM SCI) M152A - Introductory Digital Design Laboratory Lab 3'}, '187686205_COMSCI0152AM': {'discussion_sections': {}, 'lecture_timing': [['Tuesday', '10am', '11:50am'], ['Thursday', '10am', '11:50am']], 'lecture_names': 'Computer Science (COM SCI) M152A - Introductory Digital Design Laboratory Lab 5'}, '187686206_COMSCI0152AM': {'discussion_sections': {}, 'lecture_timing': [['Tuesday', '12pm', '1:50pm'], ['Thursday', '12pm', '1:50pm']], 'lecture_names': 'Computer Science (COM SCI) M152A - Introductory Digital Design Laboratory Lab 6'}, '187686207_COMSCI0152AM': {'discussion_sections': {}, 'lecture_timing': [['Tuesday', '2pm', '3:50pm'], ['Thursday', '2pm', '3:50pm']], 'lecture_names': 'Computer Science (COM SCI) M152A - Introductory Digital Design Laboratory Lab 7'}}, 'units': 2}, 'COM SCI 152B': {'lecture_sections': {'187689200_COMSCI0152B': {'discussion_sections': {'187689201_187689200_COMSCI0152B': {'discussion_timing': [['Friday', '12pm', '1:50pm']], 'sectionName': 'Computer Science (COM SCI) 152B - Digital Design Project Laboratory Dis 1A'}}, 'lecture_timing': [['Monday', '12pm', '1:50pm'], ['Wednesday', '12pm', '1:50pm']], 'lecture_names': 'Computer Science (COM SCI) 152B - Digital Design Project Laboratory Lab 1'}, 'instructor': 'Ershadi, G.'}, 'units': 4}, 'COM SCI 161': {'lecture_sections': {'187696200_COMSCI0161': {'discussion_sections': {'187696201_187696200_COMSCI0161': {'discussion_timing': [['Friday', '10am', '11:50am']], 'sectionName': 'Computer Science (COM SCI) 161 - Fundamentals of Artificial Intelligence Dis 1A'}, '187696202_187696200_COMSCI0161': {'discussion_timing': [['Friday', '12pm', '1:50pm']], 'sectionName': 'Computer Science (COM SCI) 161 - Fundamentals of Artificial Intelligence Dis 1B'}, '187696203_187696200_COMSCI0161': {'discussion_timing': [['Friday', '2pm', '3:50pm']], 'sectionName': 'Computer Science (COM SCI) 161 - Fundamentals of Artificial Intelligence Dis 1C'}}, 'lecture_timing': [['Monday', '2pm', '3:50pm'], ['Wednesday', '2pm', '3:50pm']], 'lecture_names': 'Computer Science (COM SCI) 161 - Fundamentals of Artificial Intelligence Lec 1'}, 'instructor': 'Darwiche, A.Y.'}, 'units': 4}, 'COM SCI C174C': {'lecture_sections': 
    {'187722200_COMSCI0174CC': {'discussion_sections': {'187722201_187722200_COMSCI0174CC': {'discussion_timing': [['Friday', '10am', '11:50am']], 'sectionName': 'Computer Science (COM SCI) C174C - Computer Animation Dis 1A'}}, 'lecture_timing': [['Monday', '6pm', '7:50pm'], ['Wednesday', '6pm', '7:50pm']], 'lecture_names': 'Computer Science (COM SCI) C174C - Computer Animation Lec 1'}, 'instructor': 'Terzopoulos, D.'}, 'units': 4}, 'COM SCI 180': {'lecture_sections': {'187780200_COMSCI0180': {'discussion_sections': {'187780201_187780200_COMSCI0180': {'discussion_timing': [['Friday', '10am', '11:50am']], 'sectionName': 'Computer Science (COM SCI) 180 - Introduction to Algorithms and Complexity Dis 1A'}, '187780202_187780200_COMSCI0180': {'discussion_timing': [['Friday', '12pm', '1:50pm']], 'sectionName': 'Computer Science (COM SCI) 180 - Introduction to Algorithms and Complexity Dis 1B'}, '187780203_187780200_COMSCI0180': {'discussion_timing': [['Friday', '2pm', '3:50pm']], 'sectionName': 'Computer Science (COM SCI) 180 - Introduction to Algorithms and Complexity Dis 1C'}}, 'lecture_timing': [['Monday', '8am', '9:50am'], ['Wednesday', '8am', '9:50am']], 'lecture_names': 'Computer Science (COM SCI) 180 - Introduction to Algorithms and Complexity Lec 1'}, 'instructor': 'Sarrafzadeh, M.'}, 'units': 4}, 'COM SCI 181': {'lecture_sections': {'187787200_COMSCI0181': {'discussion_sections': {'187787201_187787200_COMSCI0181': {'discussion_timing': [['Friday', '2pm', '3:50pm']], 'sectionName': 'Computer Science (COM SCI) 181 - Introduction to Formal Languages and Automata Theory Dis 1A'}, '187787202_187787200_COMSCI0181': {'discussion_timing': [['Friday', '12pm', '1:50pm']], 'sectionName': 'Computer Science (COM SCI) 181 - Introduction to Formal Languages and Automata Theory Dis 1B'}, '187787203_187787200_COMSCI0181': {'discussion_timing': [['Friday', '2pm', '3:50pm']], 'sectionName': 'Computer Science (COM SCI) 181 - Introduction to Formal Languages and Automata Theory Dis 1C'}}, 'lecture_timing': [['Tuesday', '2pm', '3:50pm'], ['Thursday', '2pm', '3:50pm']], 'lecture_names': 'Computer Science (COM SCI) 181 - Introduction to Formal Languages and Automata Theory Lec 1'}, 'instructor': 'Sherstov, A.'}, 'units': 4}, 'COM SCI 183': {'lecture_sections': {'187799200_COMSCI0183': {'discussion_sections': {'187799201_187799200_COMSCI0183': {'discussion_timing': [['Friday', '12pm', '1:50pm']], 'sectionName': 'Computer Science (COM SCI) 183 - Introduction to Cryptography Dis 1A'}, '187799202_187799200_COMSCI0183': {'discussion_timing': [['Friday', '2pm', '3:50pm']], 'sectionName': 'Computer Science (COM SCI) 183 - Introduction to Cryptography Dis 1B'}}, 'lecture_timing': [['Monday', '12pm', '1:50pm'], ['Wednesday', '12pm', '1:50pm']], 'lecture_names': 'Computer Science (COM SCI) 183 - Introduction to Cryptography Lec 1'}, 'instructor': 'Ostrovsky, R.'}, 'units': 4}, 'COM SCI CM186': {'lecture_sections': {'187820200_COMSCI0186CM': {'discussion_sections': {'187820201_187820200_COMSCI0186CM': {'discussion_timing': [['Friday', '4pm', '5:50pm']], 'sectionName': 'Computer Science (COM SCI) CM186 - Computational Systems Biology: Modeling and Simulation of Biological Systems Lab 1A'}}, 'lecture_timing': [['Tuesday', '4pm', '5:50pm'], ['Thursday', '4pm', '5:50pm']], 'lecture_names': 'Computer Science (COM SCI) CM186 - Computational Systems Biology: Modeling and Simulation of Biological Systems Lec 1'}, 'instructor': 'Distefano, J.'}, 'units': 5}, 'COM SCI CM187': {'lecture_sections': {'187822200_COMSCI0187CM': {'discussion_sections': {}, 'lecture_timing': [['Tuesday', '2pm', '3:50pm'], ['Thursday', '2pm', '3:50pm']], 'lecture_names': 'Computer Science (COM SCI) CM187 - Research Communication in Computational and Systems Biology Lec 1'}, 'instructor': 'Pellegrini, M.'}, 'units': 4}, 'COM SCI 192': 'None', 'COM SCI 201': {'lecture_sections': {'587005200_COMSCI0201': {'discussion_sections': {}, 'lecture_timing': [['Tuesday', '4pm', '5:50pm'], ['Thursday', '4pm', '5:50pm']], 'lecture_names': 'Computer Science (COM SCI) 201 - Computer Science Seminar Sem 1'}, 'instructor': 'Gu, Q.'}, 'units': 2}, 'COM SCI 216': {'lecture_sections': {'587096200_COMSCI0216': {'discussion_sections': {}, 'lecture_timing': [['Tuesday', '10am', '11:50am'], ['Thursday', '10am', '11:50am']], 'lecture_names': 'Computer Science (COM SCI) 216 - Network Algorithmics Lec 1'}, 'instructor': 'Varghese, G.'}, 'units': 4}, 'COM SCI 217B': {'lecture_sections': {'587104200_COMSCI0217B': {'discussion_sections': {}, 'lecture_timing': [['Tuesday', '6pm', '7:50pm'], ['Thursday', '6pm', '7:50pm']], 'lecture_names': 'Computer Science (COM SCI) 217B - Advanced Topics in Internet Research Lec 1'}, 'instructor': 'Zhang, L.'}, 'units': 4}, 'COM SCI 219001': {'lecture_sections': {'587114200_COMSCI0219001': {'discussion_sections': {}, 'lecture_timing': [['Monday', '10am', '11:50am'], ['Wednesday', '10am', '11:50am']], 'lecture_names': 'Computer Science (COM SCI) 219 - Current Topics in Computer System Modeling Analysis: Intelligent IoT Systems Lec 1'}, 'instructor': 'Abari, O.'}, 'units': 4}, 'COM SCI M229S001': {'lecture_sections': {'587179201_COMSCI0229SM001': {'discussion_sections': {}, 'lecture_timing': [['Monday', '12pm', '1:50pm'], ['Wednesday', '12pm', '1:50pm']], 'lecture_names': 'Computer Science (COM SCI) M229S - Seminar: Current Topics in Bioinformatics Sem 1'}, 'instructor': 'Sankararaman, S.'}, 'units': 4}, 'COM SCI 230': {'lecture_sections': {'587181200_COMSCI0230': {'discussion_sections': {}, 'lecture_timing': [['Monday', '10am', '11:50am'], ['Wednesday', '10am', '11:50am']], 'lecture_names': 'Computer Science (COM SCI) 230 - Software Engineering Lec 1'}, 'instructor': 'Kim, M.'}, 'units': 4}, 'COM SCI 236': 'None', 'COM SCI 239002': {'lecture_sections': {'587232210_COMSCI0239002': {'discussion_sections': {}, 'lecture_timing': [['Monday', '2pm', '3:50pm'], ['Wednesday', '2pm', '3:50pm']], 'lecture_names': 'Computer Science (COM SCI) 239 - Current Topics in Computer Science: Programming Languages and Systems: Advanced Cloud Systems Lec 2'}, 'instructor': 'Xu, H.'}, 'units': 4}, 'COM SCI 239001': {'lecture_sections': {'587232200_COMSCI0239001': {'discussion_sections': {}, 'lecture_timing': [['Tuesday', '2pm', '3:50pm'], ['Thursday', '2pm', '3:50pm']], 'lecture_names': 'Computer Science (COM SCI) 239 - Current Topics in Computer Science: Programming Languages and Systems: Quantum Algorithms Lec 1'}, 'instructor': 'Palsberg, J.'}, 'units': 4}, 'COM SCI 249001': {'lecture_sections': {'587294200_COMSCI0249001': {'discussion_sections': {}, 'lecture_timing': [['Tuesday', '10am', '11:50am'], ['Thursday', '10am', '11:50am']], 'lecture_names': 'Computer Science (COM SCI) 249 - Current Topics in Data Structures: Graph Neural Networks Lec 1'}, 'instructor': 'Sun, Y.'}, 'units': 4}, 'COM SCI 259001': {'lecture_sections': {'587357200_COMSCI0259001': {'discussion_sections': {}, 'lecture_timing': [['Tuesday', '2pm', '3:50pm'], ['Thursday', '2pm', '3:50pm']], 'lecture_names': 'Computer Science (COM SCI) 259 - Current Topics in Computer Science: System Design/Architecture: Learning Machines Lec 1'}, 'instructor': 'Nowatzki, A.J.'}, 'units': 4}, 'COM SCI 260B': 'None', 'COM SCI 263': 'None', 'COM SCI 267A': {'lecture_sections': {'587398200_COMSCI0267A': {'discussion_sections': {'587398201_587398200_COMSCI0267A': {'discussion_timing': [['Friday', '2pm', '3:50pm']], 'sectionName': 'Computer Science (COM SCI) 267A - Probabilistic Programming and Relational Learning Dis 1A'}}, 'lecture_timing': [['Tuesday', '2pm', '3:50pm'], ['Thursday', '2pm', '3:50pm']], 'lecture_names': 'Computer Science (COM SCI) 267A - Probabilistic Programming and Relational Learning Lec 1'}, 'instructor': 'Van den Broeck, G.'}, 'units': 4}, 'COM SCI 269002': {'lecture_sections': {'587410210_COMSCI0269002': {'discussion_sections': {}, 'lecture_timing': [['Monday', '2pm', '3:50pm'], ['Wednesday', '2pm', '3:50pm']], 'lecture_names': 'Computer Science (COM SCI) 269 - Seminar: Current Topics in Artificial Intelligence: Adversarial Robustness of Machine Learning Models Sem 2'}, 'instructor': 'Hsieh, C.'}, 'units': 4}, 'COM SCI 269001': {'lecture_sections': {'587410200_COMSCI0269001': {'discussion_sections': {}, 'lecture_timing': [['Tuesday', '2pm', '3:50pm'], ['Thursday', '2pm', '3:50pm']], 'lecture_names': 'Computer Science (COM SCI) 269 - Seminar: Current Topics in Artificial Intelligence: Foundations of Deep Learning Sem 1'}, 'instructor': 'Gu, Q.'}, 'units': 4}, 'COM SCI 269005': {'lecture_sections': {'587410250_COMSCI0269005': {'discussion_sections': {}, 'lecture_timing': [['Monday', '4pm', '5:50pm'], ['Wednesday', '4pm', '5:50pm']], 'lecture_names': 'Computer Science (COM SCI) 269 - Seminar: Current Topics in Artificial Intelligence: Human-Centered Artificial Intelligence for Vision and Autonomy Sem 5'}, 'instructor': 'Zhou, B.'}, 'units': 4}, 'COM SCI 269003': {'lecture_sections': {'587410220_COMSCI0269003': {'discussion_sections': {}, 'lecture_timing': [['Monday', '10am', '11:50am'], ['Wednesday', '10am', '11:50am']], 'lecture_names': 'Computer Science (COM SCI) 269 - Seminar: Current Topics in Artificial Intelligence: Large-Scale Machine Learning Projects Sem 3'}, 'instructor': 'Mirzasoleiman, B.'}, 'units': 4}, 'COM SCI 269004': {'lecture_sections': {'587410230_COMSCI0269004': {'discussion_sections': {}, 'lecture_timing': [['Monday', '10am', '11:50am'], ['Wednesday', '10am', '11:50am']], 'lecture_names': 'Computer Science (COM SCI) 269 - Seminar: Current Topics in Artificial Intelligence Sem 4'}, 'instructor': 'Peng, N.'}, 'units': 4}, 'COM SCI 275': {'lecture_sections': {'587450200_COMSCI0275': {'discussion_sections': {}, 'lecture_timing': [['Monday', '2pm', '3:50pm'], ['Wednesday', '2pm', '3:50pm']], 'lecture_names': 'Computer Science (COM SCI) 275 - Artificial Life for Computer Graphics and Vision Lec 1'}, 'instructor': 'Terzopoulos, D.'}, 'units': 4}, 'COM SCI CM286': {'lecture_sections':
     {'587517200_COMSCI0286CM': {'discussion_sections': {'587517201_587517200_COMSCI0286CM': {'discussion_timing': [['Friday', '4pm', '5:50pm']], 'sectionName': 'Computer Science (COM SCI) CM286 - Computational Systems Biology: Modeling and Simulation of Biological Systems Lab 1A'}}, 'lecture_timing': [['Tuesday', '4pm', '5:50pm'], ['Thursday', '4pm', '5:50pm']], 'lecture_names': 'Computer Science (COM SCI) CM286 - Computational Systems Biology: Modeling and Simulation of Biological Systems Lec 1'}, 'instructor': 'Distefano, J.'}, 'units': 5}, 'COM SCI CM287': {'lecture_sections': {'587522201_COMSCI0287CM': {'discussion_sections': {}, 'lecture_timing': [['Tuesday', '2pm', '3:50pm'], ['Thursday', '2pm', '3:50pm']], 'lecture_names': 'Computer Science (COM SCI) CM287 - Research Communication in Computational and Systems Biology Lec 1'}, 'instructor': 'Pellegrini, M.'}, 'units': 4}, 'COM SCI 289A001': {'lecture_sections': {'587545200_COMSCI0289A001': {'discussion_sections': {}, 'lecture_timing': [['Monday', '4pm', '5:50pm'], ['Wednesday', '4pm', '5:50pm']], 'lecture_names': 'Computer Science (COM SCI) 289A - Current Topics in Computer Theory: Advanced Topics in Cryptography Lec 1'}, 'instructor': 'Sahai, A.'}, 'units': 4}}}
    
    this.allCourses = data.all_classes;
    this.allProfs = data.all_profs.sort();
    this.fullClassInfo = data.class_info;
  },

  methods:{

    addTakenCourse(c){
      this.studentCourses.push(c);
      this.allCourses = this.allCourses.filter(item => item !== c);
    },

    removeTakenCourse(c){
      this.studentCourses = this.studentCourses.filter(item => item !== c);
      this.allCourses.push(c);
    },

    removeTimeRestriction(i){
      this.timeRestrictions.splice(i,1);
    },

    removeGoodProfessor(i){
      this.goodProfs.splice(i,1);
    },

    removeBadProfessor(i){
      this.badProfs.splice(i,1);
    },

    generateClasses(){
      console.log(this.fullClassInfo);
      document.getElementById('loader').style = 'display: inline-block';
      setTimeout(() => {
        document.getElementById('loader').style = 'display: none';
        if(this.studentCourses[0] == 'COM SCI 1'){
          this.outputClassList.push(['COM SCI 33', 'Lecture 1', 'Discussion 1B']);
          this.outputClassList.push(['COM SCI M16', 'Lecture 2', 'Discussion 1C']);
          this.outputClassList.push(['COM SCI 111', 'Lecture 1', 'Discussion 1B']);
        }
        else{
          this.outputClassList.push(['COM SCI 131', 'Lecture 1', 'Discussion 1B']);
          this.outputClassList.push(['COM SCI 181', 'Lecture 2', 'Discussion 2A']);
          this.outputClassList.push(['COM SCI 143', 'Lecture 1', 'Discussion 1B']);
        }
      }, 2000);
      /*let allFilters = [];
      this.timeRestrictions.forEach((e) => {
        allFilters.push('MUST AVOID TIME '+e.day+' '+e.start+' '+e.end);
      });
      this.goodProfs.forEach((e) => {
        allFilters.push('HIGH PREFER INSTRUCTOR ' + e);
      })
      this.badProfs.forEach((e) => {
        allFilters.push('HIGH AVOID INSTRUCTOR ' + e);
      })
      console.log(allFilters);
      let url = 'http://localhost:3001/api/recommend';
      const options = {
        method: 'post',
        body: JSON.stringify({
          classes_taken: this.studentCourses,
          filters: allFilters,

        }),
        headers: {'Content-Type': 'application/json'}
      };
      fetch(url, options)
      .then(r => r.json())
      .then(data => {
        console.log(data);
        this.outputClasses = data.sorted_configurations.config1.classes;
      });*/
      
    },
    formatOutput(o){
      let name = o[0];
      let lec = o[1];
      let disc = o[2];
      return name + ' ('+lec+', '+disc+') ';
    }
  }
}
</script>

<style scoped>
.coursepage{
  padding: 100px 35px;
}
.courses-list-button{
  text-align: left;
  font-size: 20px;
  font-weight: 800;
  background: #bbbbbb;
  padding: 5px;
  cursor: pointer;
}
.courses-lists{
  display: flex;
  flex-direction:row;
  justify-content: space-evenly;
  transition: 1s ease all;
  overflow-y: clip;
  margin: 30px 0;
}
.taken-course{
  display: flex;
  justify-content: space-between;
  user-select: none;
  align-items: center;
  border: 1px solid gray;
  width: 200px;
  margin-top: -1px;
}
.remove-taken-course, 
.add-taken-course{
  border-left: 1px solid gray;
  color: black;
  background: white;
  padding: 10px;
  border-radius: 1px;
  cursor: pointer;
}
.remove-taken-course:hover,
.add-taken-course:hover{
  background: #e0e0e0;
}
.taken-course-name{
  font-size: 16px;
  padding: 5px;
}
.course-list-header{
  font-size: 24px;
}
.course-list-overflow{
  overflow-y: scroll;
  overflow-x: clip;
  max-height: 290px;
  margin-top: 10px;
  padding: 0 15px;
}
.taken-course-ind{
  font-size: 12px;
  margin-right: 5px;
  color: #333333;
}

.all-fade-move,
.all-fade-enter-active,
.all-fade-leave-active,
.taken-fade-move,
.taken-fade-enter-active,
.taken-fade-leave-active {
  transition: all .5s ease;
}
.all-fade-enter-from,
.all-fade-leave-to {
  opacity: 0;
  transform: translateX(-100px);
}
.taken-fade-enter-from,
.taken-fade-leave-to {
  opacity: 0;
  transform: translateX(100px);
}
.all-fade-leave-active,
.taken-fade-leave-active {
  position: absolute;
}

.generate-region{
  margin-top: 80px;
}
.generate-button{
  border: none;
  padding: 10px;
  color: white;
  background: var(--primary-color);
  font-size: 16px;
  cursor: pointer;
}

.fa-angle-down{
  transition: .5s all;
}
.flex-down{
  flex-direction: column;
}
.time-restrictions-each{
  border: 1px solid;
  width: 200px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px;
  margin: 0 auto;
  margin-top: -1px;
}
.space-below{
  margin-bottom: 20px;
}
.time-wrapper{
  height: 200px;
  overflow-y: scroll;
  overflow-x: clip;
}
.loader {
  border: 3px solid #f3f3f3; /* Light grey */
  border-top: 3px solid var(--primary-light);
  border-radius: 50%;
  width: 10px;
  height: 10px;
  animation: spin 1s ease-in-out infinite;
  display: none;
  margin: 0 auto;
  margin-left: 20px;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.generate-output{
  margin-top: 60px;
  border: 1px solid gray;
  padding: 5px;
}
.generate-output span{
  font-weight: 600;
}
.output-each{
  margin: 15px 0;
}
</style>