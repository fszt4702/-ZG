// 智肝健康管理小程序 - 应用入口
App({
  globalData: {
    userInfo: null,           // 当前登录用户信息
    isLoggedIn: false,        // 登录状态
    currentMember: null,      // 当前选中的家庭成员
    members: [],              // 家庭成员列表
    role: null,               // 'patient' | 'doctor' | null
    doctorInfo: null          // 医生详细信息 { name, hospital, department, title }
  },

  onLaunch() {
    // 初始化云开发
    if (wx.cloud) {
      wx.cloud.init({ env: 'cloud1-d8gjf8tuf7ccf8870', traceUser: true });
    }
    // 检查本地登录状态
    this.checkLoginStatus();
  },

  // 检查是否已登录
  checkLoginStatus() {
    const userInfo = wx.getStorageSync('userInfo');
    const members = wx.getStorageSync('members');
    const currentMember = wx.getStorageSync('currentMember');
    const role = wx.getStorageSync('userRole');
    const doctorInfo = wx.getStorageSync('doctorInfo');

    if (userInfo) {
      this.globalData.userInfo = userInfo;
      this.globalData.isLoggedIn = true;
      this.globalData.members = members || [];
      this.globalData.currentMember = currentMember || (members && members[0]) || null;
      this.globalData.role = role || 'patient';
      this.globalData.doctorInfo = doctorInfo || null;
    }
  },

  // 保存登录状态
  saveLoginState(userInfo, role) {
    this.globalData.userInfo = userInfo;
    this.globalData.isLoggedIn = true;
    role = role || 'patient';
    this.globalData.role = role;
    wx.setStorageSync('userInfo', userInfo);
    wx.setStorageSync('userRole', role);

    // 医生角色不涉及家庭成员数据，直接返回，避免用医生昵称污染患者档案
    if (role === 'doctor') {
      this.globalData.members = wx.getStorageSync('members') || [];
      this.globalData.currentMember = wx.getStorageSync('currentMember') || null;
      return;
    }

    // 以下仅患者角色：初始化/恢复家庭成员
    const existingMembers = wx.getStorageSync('members');
    // 自愈：旧版本医生登录会误创建名为「在线医生」的默认成员，这里重置为患者本人
    const polluted = existingMembers && existingMembers.find(m => m.isDefault && m.name === '在线医生');

    if (existingMembers && existingMembers.length > 0 && !polluted) {
      // 保留已有成员数据
      this.globalData.members = existingMembers;
      const currentMember = wx.getStorageSync('currentMember');
      this.globalData.currentMember = currentMember || existingMembers[0];
    } else {
      // 首次登录 或 数据被医生登录污染：初始化默认成员
      const defaultMember = {
        id: 'self_' + Date.now(),
        name: userInfo.nickName || '本人',
        relation: '本人',
        gender: '未知',
        age: 0,
        isDefault: true
      };
      const members = [defaultMember];
      this.globalData.members = members;
      this.globalData.currentMember = defaultMember;
      wx.setStorageSync('members', members);
      wx.setStorageSync('currentMember', defaultMember);
    }
  },

  // 切换角色
  switchRole(role, doctorInfo) {
    this.globalData.role = role;
    wx.setStorageSync('userRole', role);
    if (role === 'doctor' && doctorInfo) {
      this.globalData.doctorInfo = doctorInfo;
      wx.setStorageSync('doctorInfo', doctorInfo);
    }
  },

  // 退出登录（保留健康数据，下次登录自动恢复）
  logout() {
    this.globalData.userInfo = null;
    this.globalData.isLoggedIn = false;
    this.globalData.currentMember = null;
    this.globalData.role = null;
    this.globalData.doctorInfo = null;
    wx.removeStorageSync('userInfo');
    wx.removeStorageSync('currentMember');
    wx.removeStorageSync('userRole');
    wx.removeStorageSync('doctorInfo');
    wx.removeStorageSync('myConsultationId');
    wx.setStorageSync('justLoggedOut', true);
    // 注意：保留 userProfile（身份）、members（家庭成员）、reports（健康数据），下次登录自动恢复
  },

  // 切换账号（彻底清空所有数据，换人登录）
  switchAccount() {
    this.logout();
    wx.removeStorageSync('userProfile');
    wx.removeStorageSync('members');
    wx.removeStorageSync('currentMember');
    wx.removeStorageSync('reports');
    wx.removeStorageSync('justLoggedOut');
  }
});
