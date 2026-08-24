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
    if (wx.cloud) {
      wx.cloud.init({ env: 'cloud1-d8gjf8tuf7ccf8870', traceUser: true });
    }
    this.checkLoginStatus();
  },

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

  saveLoginState(userInfo, role) {
    this.globalData.userInfo = userInfo;
    this.globalData.isLoggedIn = true;
    role = role || 'patient';
    this.globalData.role = role;
    wx.setStorageSync('userInfo', userInfo);
    wx.setStorageSync('userRole', role);

    // 医生角色不涉及家庭成员数据
    if (role === 'doctor') {
      this.globalData.members = wx.getStorageSync('members') || [];
      this.globalData.currentMember = wx.getStorageSync('currentMember') || null;
      return;
    }

    const existingMembers = wx.getStorageSync('members');
    // 兼容旧版医生登录误创建的「在线医生」默认成员
    const polluted = existingMembers && existingMembers.find(m => m.isDefault && m.name === '在线医生');

    if (existingMembers && existingMembers.length > 0 && !polluted) {
      this.globalData.members = existingMembers;
      const currentMember = wx.getStorageSync('currentMember');
      this.globalData.currentMember = currentMember || existingMembers[0];
    } else {
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

  switchRole(role, doctorInfo) {
    this.globalData.role = role;
    wx.setStorageSync('userRole', role);
    if (role === 'doctor' && doctorInfo) {
      this.globalData.doctorInfo = doctorInfo;
      wx.setStorageSync('doctorInfo', doctorInfo);
    }
  },

  // 退出登录，保留健康数据下次自动恢复
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
  },

  switchAccount() {
    this.logout();
    wx.removeStorageSync('userProfile');
    wx.removeStorageSync('members');
    wx.removeStorageSync('currentMember');
    wx.removeStorageSync('reports');
    wx.removeStorageSync('justLoggedOut');
  }
});
