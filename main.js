let allSkills = [];
let allMembers = [
  "佐久間咲也", "碓氷真澄", "皆木綴", "茅ヶ崎至", "シトロン", "卯木千景", // 春
  "皇天馬", "瑠璃川幸", "向坂椋", "斑鳩三角", "三好一成", "兵頭九門", // 夏
  "摂津万里", "兵頭十座", "七尾太一", "伏見臣", "古市左京", "泉田莇", // 秋
  "月岡紬", "高遠丞", "有栖川誉", "御影密", "雪白東", "ガイ"           // 冬
];

window.addEventListener('DOMContentLoaded', () => {
  const select = document.getElementById('member-select');
  allMembers.forEach(name => {
    const option = document.createElement('option');
    option.value = option.textContent = name;
    select.appendChild(option);
  });

  fetch('skills.json')
    .then(res => res.json())
    .then(data => {
      allSkills = data;
    });

  select.addEventListener('change', (e) => {
    const selected = e.target.value;
    const result = findTopGroupsIncludingMember(selected);
    displayResult(result);
  });
});

function findTopGroupsIncludingMember(memberName) {
  const groups = generateAllGroups();
  const filtered = groups.filter(g => g.includes(memberName));
  const evaluated = filtered.map(group => {
    const matchedSkills = allSkills.filter(skill =>
      skill.members.every(m => group.includes(m))
    );
    const top3 = matchedSkills
      .sort((a, b) => b.value - a.value)
      .slice(0, 3);
    const total = top3.reduce((sum, skill) => sum + skill.value, 0);
    return { group, total, top3 };
  }).filter(g => g.total > 0);

  evaluated.sort((a, b) => b.total - a.total);
  const max = evaluated[0]?.total || 0;
  return evaluated.filter(g => g.total === max);
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
