<template>
    <div id="app" class="project-activity-add-container">
        <div class="project-member-add">
            <div class="project-name">添加人员</div>
            <div class="project-member-add-item">
                <div class="weui-btn weui-btn_primary weui-btn_mini" @click="addMember">添加人员</div>
            </div>
            <ul class="unregister-members">
                <li v-for="(member,memberIndex) in form.selectedMembers">
                    <div>
                        {{member.juname}}
                        <span @click="removeMember(memberIndex)">
                            <img src="../../assets/images/icon-remove.png"/>
                        </span>
                    </div>
                </li>
            </ul>
        </div>
        <div style="height: 8px;width: 100%;background: #ececec"></div>
        <div class="project-member-add">
            <div class="project-name">
                起始时间
            </div>

            <div class="project-add-form">
                <div class="form-item">
                    <label>开始时间</label>
                    <input type="text" placeholder="请选择开始时间" v-model="form.startDate"/>
                    <input type="date" class="project-add-form-date" v-model="form.actStartDate">
                </div>
                <div class="form-item">
                    <label>结束时间</label>
                    <input type="text" placeholder="请选择结束时间" v-model="form.endDate"/>
                    <input type="date" class="project-add-form-date" v-model="form.actEndDate">
                </div>
                <div class="form-item">
                    <label>备注</label>
                    <input type="text" placeholder="请输入备注" v-model="form.remark"/>
                </div>
            </div>
        </div>
        <div style="height: 8px;width: 100%;background: #ececec"></div>
        <div class="project-member-add">
            <div class="project-name">
                支出明细
            </div>
            <div class="project-add-form project-add-form-content" v-for="(item,itemIndex) in form.details">
                <div class="form-item">
                    <label>报销内容</label>
                    <input type="text" placeholder="请输入报销内容" v-model="item.name"/>
                </div>
                <div class="form-item">
                    <label>金额</label>
                    <input type="number" placeholder="请输入金额" v-model="item.money"/>
                </div>
                <div class="project-icon-remove" @click="removeItem(itemIndex)">
                    <b></b>
                    <b></b>
                    <b></b>
                </div>
            </div>
            <div class="add-new-detail" @click="addNewItem">添加一条明细</div>
        </div>
        <div style="height: 60px"></div>
        <div class="project-add-form-buttons">
            <div class="sure" @click="save">完成添加</div>
            <div class="cancel" @click="closeWindow">取消添加</div>
        </div>
    </div>
</template>

<script>
  import {getPageParams, confirm, closeWindow, toast} from "../../utils/ApiCloudUtils";
  import {buildSelector} from "../../utils/SelectorUtil";
  import {formatDate} from "../../utils/CommonUtils";
  import {createProjectActivity} from "../../utils/DataUtils";

  export default {
    name: 'app',
    data() {
      return {
        project: {},
        form: {
          remark: null,
          actStartDate: null,
          actEndDate: null,
          selectedMembers: [],
          details: [],
          get startDate() {
            if (!this.actStartDate) {
              return null;
            }

            return formatDate(new Date(this.actStartDate).getTime(), 'yyyy年MM月dd日');
          },
          get endDate() {
            if (!this.actEndDate) {
              return null;
            }

            return formatDate(new Date(this.actEndDate).getTime(), 'yyyy年MM月dd日');
          },
          get members() {
            return this.selectedMembers.map(member => member.id);
          },
          get items() {
            return JSON.stringify(this.details);
          }
        }
      }
    },
    async created() {
      let {project} = await getPageParams();
      this.project = project;
      this.addNewItem();
    },
    methods: {
      closeWindow,
      addNewItem() {
        this.form.details.push({
          money: '',
          name: ''
        });
      },
      async removeItem(itemIndex) {
        if (!await confirm('确认删除这条明细？')) {
          return;
        }

        this.form.details.splice(itemIndex, 1);
      },
      buildSelectMembers() {
        let members = this.form.members;
        return this.project.members.map(member => {
          return {
            text: member.mobile ? `${member.juname}   ${member.mobile}` : member.juname,
            juname: member.juname,
            id: member.pmid,
            status: members.indexOf(member.pmid) === -1 ? 'normal' : 'selected'
          }
        });
      },
      removeMember(index) {
        this.form.selectedMembers.splice(index, 1);
      },
      async addMember() {
        let details = await buildSelector(this.buildSelectMembers(), false);
        if (!details) {
          return;
        }

        this.form.selectedMembers = details;
        console.log('this.form.selectedMembers', JSON.stringify(this.form.selectedMembers));
      },
      _validate() {
        if (this.form.selectedMembers.length === 0) {
          return toast('请选择人员');
        }
        if (!this.form.startDate || !this.form.endDate) {
          return toast('请选择起始时间');
        }
        if (this.form.details.length === 0) {
          return toast('请添加支出明细');
        }
        let itemIndexs = [];
        this.form.details.forEach((item, index) => {
          if (item.name && item.money) {

          } else {
            itemIndexs.push(index + 1);
          }
        });
        if (itemIndexs.length > 0) {
          let indexs = itemIndexs.join('，');
          return toast(`请将第${indexs}条支出明细补充完整`);
        }

        return true;
      },
      async save() {
        console.log('form', JSON.stringify(this.form));
        if (!this._validate()) {
          console.log('_validate failed');
          return;
        }
        console.log('_validate success');

        let {c, m} = await createProjectActivity(this.project.jpid, this.form);
        if (c !== 0) {
          return;
        }

        toast(m);
        setTimeout(closeWindow, 300);
      }
    }
  }
</script>

<style lang="less">
    @import "../../assets/style";

    .project-activity-add-container{
        .project-member-add {
            padding: 0 14px;

            .project-name {
                position: relative;
                padding-left: 26px;
                padding-top: 20px;
                padding-bottom: 20px;
                font-size: 15px;
                letter-spacing: 1px;
                line-height: 24px;
                font-weight: 900;
                background-color: #fff;

                &:before {
                    position: absolute;
                    content: ' ';
                    left: 11px;
                    top: 20.5px;
                    width: 5.5px;
                    height: 22px;
                    background: rgb(63, 103, 233);
                    -webkit-border-radius: 3.8px;
                    -moz-border-radius: 3.8px;
                    border-radius: 3.8px;
                }
            }
            .project-member-add-item {
                position: relative;
                padding-left: 8px;
                padding-right: 120px;
                padding-bottom: 24px;
                &:after {
                    position: absolute;
                    content: ' ';
                    left: 8px;
                    right: 8px;
                    bottom: 0;
                    height: 1px;
                    background-color: #eee;
                    -webkit-transform: scaleY(0.5);
                    -moz-transform: scaleY(0.5);
                    -ms-transform: scaleY(0.5);
                    -o-transform: scaleY(0.5);
                    transform: scaleY(0.5);
                }

                .weui-btn {
                    height: 35px;
                    line-height: 35px;
                    width: 90px;
                }
            }
            .unregister-members {
                list-style: none;
                padding: 14px 8px 40px 8px;

                li {
                    display: inline-block;
                    position: relative;
                    width: 32%;
                    margin-bottom: 12px;
                    padding-right: 20px;

                    div {
                        position: relative;
                        height: 30px;
                        font-size: 15px;
                        line-height: 30px;
                        text-align: center;
                        color: #7f7f7f;
                        background: #e7e3e3;
                        -webkit-border-radius: 5px;
                        -moz-border-radius: 5px;
                        border-radius: 5px;
                    }
                    span {
                        position: absolute;
                        display: block;
                        right: -10px;
                        top: -10px;
                        width: 20px;
                        height: 20px;
                        img {
                            width: 19px;
                            height: 19px;
                        }
                    }
                }
            }
        }

        .project-add-form {
            padding-bottom: 0;
            &.project-add-form-content {
                position: relative;
                background: #fff;
                padding-bottom: 30px;
                .form-item:before {
                    display: none !important;
                }

                &:first-child:before,
                &:after {
                    position: absolute;
                    content: '';
                    top: 0;
                    left: 22px;
                    right: 22px;
                    height: 1px;
                    background: #dadada;
                    -webkit-transform: scaleY(0.5);
                    -moz-transform: scaleY(0.5);
                    -ms-transform: scaleY(0.5);
                    -o-transform: scaleY(0.5);
                    transform: scaleY(0.5);
                }
            }
        }

        .add-new-detail {
            margin-top: 20px;
            height: 33px;
            line-height: 33px;
            text-align: center;
            color: #3dcf7b;
            border: 1px dashed #3dcf7b;
            -webkit-border-radius: 5px;
            -moz-border-radius: 5px;
            border-radius: 5px;
        }
    }

</style>
