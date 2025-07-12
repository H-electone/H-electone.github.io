let allSkills = [];
let allMembers = [
  "咲也", "真澄", "綴", "至", "シトロン", "千景", // 春
  "天馬", "幸", "椋", "三角", "一成", "九門", // 夏
  "万里", "十座", "太一", "臣", "左京", "莇", // 秋
  "紬", "丞", "誉", "密", "東", "ガイ"           // 冬
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
