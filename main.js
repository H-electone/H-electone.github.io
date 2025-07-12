let allSkills = [];
/* let allMembers = [
  "咲也", "真澄", "綴", "至", "シトロン", "千景", // 春
  "天馬", "幸", "椋", "三角", "一成", "九門", // 夏
  "万里", "十座", "太一", "臣", "左京", "莇", // 秋
  "紬", "丞", "誉", "密", "東", "ガイ"           // 冬
]; */

const membersByGroup = {
  春組: ["咲也", "真澄", "綴", "至", "シトロン", "千景"],
  夏組: ["天馬", "幸", "椋", "三角", "一成", "九門"],
  秋組: ["万里", "十座", "太一", "臣", "左京", "莇"],
  冬組: ["紬", "丞", "誉", "密", "東", "ガイ"]
};

const allMembers = Object.values(membersByGroup).flat();

window.addEventListener('DOMContentLoaded', () => {
  const groupSelect = document.getElementById('group-select');
  const memberSelect = document.getElementById('member-select');

  // 組を選んだら劇団員を更新
  groupSelect.addEventListener('change', (e) => {
    const group = e.target.value;
    memberSelect.innerHTML = '<option value="">-- 劇団員を選択 --</option>';
    if (group && membersByGroup[group]) {
      membersByGroup[group].forEach(name => {
        const option = document.createElement('option');
        option.value = option.textContent = name;
        memberSelect.appendChild(option);
      });
    }
  });

  // fetch skill データ
  fetch('skills.json')
    .then(res => res.json())
    .then(data => {
      allSkills = data;
    });

  // 劇団員が選ばれたら結果表示
  memberSelect.addEventListener('change', (e) => {
    const selected = e.target.value;
    if (selected) {
      const result = findTopGroupsIncludingMember(selected);
      displayResult(result);
    } else {
      document.getElementById('result').textContent = '';
    }
  });
});


function findTopGroupsIncludingMember(memberName) {
  const groups = generateAllGroups();
  const filtered = groups.filter(g => g.includes(memberName));

  const evaluated = filtered.map(group => {
    const matchedSkills = allSkills.filter(skill =>
      skill.members.every(m => group.includes(m))
    );

    // 排他グループを考慮したスキル組み合わせのうち、上位3つを選ぶ
    const validSkillCombos = getTop3NonExclusiveCombos(matchedSkills);

    if (validSkillCombos.length === 0) return null;

    const total = validSkillCombos.reduce((sum, skill) => sum + skill.value, 0);
    return { group, total, top3: validSkillCombos };
  }).filter(g => g && g.total > 0);

  evaluated.sort((a, b) => b.total - a.total);
  const max = evaluated[0]?.total || 0;
  return evaluated.filter(g => g.total === max);
}

function getTop3NonExclusiveCombos(skills) {
  // 降順でソート
  const sorted = [...skills].sort((a, b) => b.value - a.value);

  const selected = [];
  const usedExclusiveGroups = new Set();

  for (const skill of sorted) {
    const groupId = skill.exclusiveGroup;

    // 排他グループの重複を回避
    if (groupId && usedExclusiveGroups.has(groupId)) continue;

    selected.push(skill);
    if (groupId) usedExclusiveGroups.add(groupId);

    if (selected.length === 3) break;
  }

  return selected;
}


function generateAllGroups() {
  const results = [];
  const combine = (arr, k, start = 0, path = []) => {
    if (path.length === k) {
      results.push([...path]);
      return;
    }
    for (let i = start; i < arr.length; i++) {
      path.push(arr[i]);
      combine(arr, k, i + 1, path);
      path.pop();
    }
  };
  combine(allMembers, 6);
  return results;
}

function displayResult(groups) {
  const resultDiv = document.getElementById('result');
  resultDiv.innerHTML = '';

  if (groups.length === 0) {
    resultDiv.textContent = '該当するグループはありません。';
    return;
  }

  groups.forEach(({ group, total, top3 }) => {
    const div = document.createElement('div');
    div.innerHTML = `
      <p><strong>合計値: ${total}</strong></p>
      <p>メンバー: ${group.join(', ')}</p>
      <ul>
        ${top3.map(s => `<li>${s.name} (${s.value})</li>`).join('')}
      </ul>
    `;
    resultDiv.appendChild(div);
  });
}
