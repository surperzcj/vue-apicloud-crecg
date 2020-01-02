<template>
    <div id="app">
        <ProjectHeader :project="project"/>
        <multi-selector :list="types" v-model="selectedType" ref="selectedType" title="选择支出类型"/>
        <div class="project-activity-add">
            <div class="project-member-add">
                <div class="project-add-form">
                    <div class="form-item">
                        <label>时间</label>
                        <input type="text" placeholder="请选择时间" v-model="form.time"/>
                        <input type="date" class="project-add-form-date" v-model="form.actDate">
                    </div>
                    <div class="form-item">
                        <label>支出类型</label>
                        <input type="text" placeholder="请选择支出类型" readonly v-model="form.typeName"
                               @click="$refs.selectedType.show()"/>
                    </div>
                    <div class="form-item">
                        <label>金额</label>
                        <input type="number" placeholder="请输入金额" v-model="form.money"/>
                    </div>
                </div>
            </div>
            <div class="project-add-form-buttons">
                <div class="sure" @click="save"
                     :style="{'height':`${footerHeight}px`, 'line-height':`${footerHeight}px`}">完成添加
                </div>
                <div class="cancel" @click="closeWindow"
                     :style="{'height':`${footerHeight}px`, 'line-height':`${footerHeight}px`}">取消添加
                </div>
            </div>
        </div>
    </div>
</template>

<script>
  import MultiSelector from '../../components/MultiSelector'
  import ProjectHeader from '../../components/ProjectHeader.vue'
  import {getPageParams, closeWindow, toast} from "../../utils/ApiCloudUtils";
  import {formatDate} from "../../utils/CommonUtils";
  import {createProjectSpend} from "../../utils/DataUtils";

  export default {
    name: 'app',
    components: {ProjectHeader, MultiSelector},
    data() {
      return {
        project: {},
        paddingBottom: 0,
        form: {
          actDate: null,
          get time() {
            if (!this.actDate) {
              return null;
            }

            return formatDate(new Date(this.actDate).getTime(), 'yyyy年MM月dd日');
          },
          type: 0,
          typeName: '',
          money: null,
        },
        types: [
          {id: 1, text: '日常支出', status: 'normal'},
          {id: 2, text: '设备采购', status: 'normal'},
          {id: 3, text: '外委', status: 'normal'},
        ],
        selectedType: null
      }
    },
    async created() {
      let {project} = await getPageParams();
      this.project = project;
      this.paddingBottom = window.api.safeArea.bottom;
    },
    watch: {
      selectedType() {
        this.form.type = this.selectedType.id;
        this.form.typeName = this.selectedType.text;
        console.log(this.form.type);
      }
    },
    computed: {
      footerHeight() {
        return this.paddingBottom + 40
      }
    },
    methods: {
      closeWindow,
      async save() {
        let errors = {
          time: '请选择时间',
          type: '请选择支出类型',
          money: '请输入金额',
        };
        let hasError = false;
        Object.keys(errors).forEach(key => {
          if (!this.form[key]) {
            toast(errors[key]);
            hasError = true;
          }
        });
        if (hasError) {
          return;
        }

        let {c, m} = await createProjectSpend(this.project.jpid, this.form);
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

    .project-activity-add {
        padding-bottom: @footerHeight;
        .project-add-form {
            padding-bottom: 0;
        }
    }
</style>
