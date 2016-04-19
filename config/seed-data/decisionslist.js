var milestones = [{
    code: 'project-description',
    name: 'Project Description',
    description: 'Project Description',
    artifactType: 'Project Description'
},{
    code: 'section-10-1-a-order',
    name: 'Section 10(1)(a) Order',
    description: 'Section 10(1)(a) Order',
    artifactType: 'Section 10(1)(a) Order'
},{
    code: 'section-10-1-b-order',
    name: 'Section 10(1)(b) Order',
    description: 'Section 10(1)(b) Order',
    artifactType: 'Section 10(1)(b) Order'
},{
    code: 'section-10-1-c-order',
    name: 'Section 10(1)(c) Order',
    description: 'Section 10(1)(c) Order',
    artifactType: 'Section 10(1)(c) Order'
},{
    code: 'section-11-order',
    name: 'Section 11 Order',
    description: 'Section 11 Order',
    artifactType: 'Section 11 Order'
},{
    code: 'section-7-3-order',
    name: 'Section 7(3) Order',
    description: 'Section 7(3) Order',
    artifactType: 'Section 7(3) Order'
},{
    code: 'valued-component',
    name: 'Valued Component',
    description: 'Valued Component',
    artifactType: 'Valued Component'
},{
    code: 'schedule-a',
    name: 'Schedule A',
    description: 'Schedule A',
    artifactType: 'Schedule A'
}];

var activities = [{
    code: 'decision',
    name: 'Artifact Decision',
    description: 'Decision on Artifact',
    state: 'p.artifact.decision'
}];

var templates = [{
    "artifact" : null,
    "templateType" : "Artifact",
    "sections" : [
        {
            "meta" : [
                {
                    "default" : "",
                    "label" : "Memo to the Minister from the Associate Deputy Minister",
                    "type" : "Artifact",
                    "name" : "a"
                }
            ],
            "footer" : "",
            "header" : "",
            "template" : "{{a}}",
            "isfooter" : false,
            "isheader" : false,
            "multiple" : false,
            "optional" : false,
            "label" : "Memo to the Minister from the Associate Deputy Minister",
            "name" : "memo1"
        },
        {
            "meta" : [
                {
                    "default" : "",
                    "label" : "Recommendations of the Executive Director",
                    "type" : "Artifact",
                    "name" : "b"
                }
            ],
            "footer" : "",
            "header" : "",
            "template" : "{{b}}",
            "isfooter" : false,
            "isheader" : false,
            "multiple" : false,
            "optional" : false,
            "label" : "Recommendations of the Executive Director",
            "name" : "memo2"
        },
        {
            "meta" : [
                {
                    "default" : "",
                    "label" : "Environmental Certificate",
                    "type" : "Artifact",
                    "name" : "c"
                }
            ],
            "footer" : "",
            "header" : "",
            "template" : "{{c}}",
            "isfooter" : false,
            "isheader" : false,
            "multiple" : false,
            "optional" : false,
            "label" : "Environmental Certificate",
            "name" : "memo3"
        },
        {
            "meta" : [
                {
                    "default" : "",
                    "label" : "Schedule A: Certified Project Description",
                    "type" : "Artifact",
                    "name" : "d"
                }
            ],
            "footer" : "",
            "header" : "",
            "template" : "{{d}}",
            "isfooter" : false,
            "isheader" : false,
            "multiple" : false,
            "optional" : false,
            "label" : "Schedule A: Certified Project Description",
            "name" : "pd"
        },
        {
            "meta" : [
                {
                    "default" : "",
                    "label" : "Schedule B: Table of Conditions",
                    "type" : "Artifact",
                    "name" : "e"
                }
            ],
            "footer" : "",
            "header" : "",
            "template" : "{{e}}",
            "isfooter" : false,
            "isheader" : false,
            "multiple" : false,
            "optional" : false,
            "label" : "Schedule B: Table of Conditions",
            "name" : "conds"
        },
        {
            "meta" : [
                {
                    "default" : "",
                    "label" : "Application",
                    "type" : "Artifact",
                    "name" : "f"
                }
            ],
            "footer" : "",
            "header" : "",
            "template" : "{{f}}",
            "isfooter" : false,
            "isheader" : false,
            "multiple" : false,
            "optional" : false,
            "label" : "Application",
            "name" : "app"
        }
    ],
    "versionNumber" : 1,
    "documentType" : "Referral Package",
    "code" : "referral-package"
},{
    "artifact" : null,
    "templateType" : "Artifact",
    "sections" : [
        {
            "meta" : [
                {
                    "default" : "",
                    "label" : "reason for decision",
                    "type" : "Html",
                    "name" : "re"
                }
            ],
            "footer" : "",
            "header" : "",
            "template" : "{{re}}",
            "isfooter" : false,
            "isheader" : false,
            "multiple" : false,
            "optional" : false,
            "label" : "Minister's Reason for Acceptance",
            "name" : "reason"
        },
       {
            "meta" : [
                {
                    "default" : "",
                    "label" : "Memo to the Minister from the Associate Deputy Minister",
                    "type" : "Artifact",
                    "name" : "a"
                }
            ],
            "footer" : "",
            "header" : "",
            "template" : "{{a}}",
            "isfooter" : false,
            "isheader" : false,
            "multiple" : false,
            "optional" : false,
            "label" : "Memo to the Minister from the Associate Deputy Minister",
            "name" : "memo1"
        },
        {
            "meta" : [
                {
                    "default" : "",
                    "label" : "Recommendations of the Executive Director",
                    "type" : "Artifact",
                    "name" : "b"
                }
            ],
            "footer" : "",
            "header" : "",
            "template" : "{{b}}",
            "isfooter" : false,
            "isheader" : false,
            "multiple" : false,
            "optional" : false,
            "label" : "Recommendations of the Executive Director",
            "name" : "memo2"
        },
        {
            "meta" : [
                {
                    "default" : "",
                    "label" : "Environmental Certificate",
                    "type" : "Artifact",
                    "name" : "c"
                }
            ],
            "footer" : "",
            "header" : "",
            "template" : "{{c}}",
            "isfooter" : false,
            "isheader" : false,
            "multiple" : false,
            "optional" : false,
            "label" : "Environmental Certificate",
            "name" : "memo3"
        },
        {
            "meta" : [
                {
                    "default" : "",
                    "label" : "Schedule A: Certified Project Description",
                    "type" : "Artifact",
                    "name" : "d"
                }
            ],
            "footer" : "",
            "header" : "",
            "template" : "{{d}}",
            "isfooter" : false,
            "isheader" : false,
            "multiple" : false,
            "optional" : false,
            "label" : "Schedule A: Certified Project Description",
            "name" : "pd"
        },
        {
            "meta" : [
                {
                    "default" : "",
                    "label" : "Schedule B: Table of Conditions",
                    "type" : "Artifact",
                    "name" : "e"
                }
            ],
            "footer" : "",
            "header" : "",
            "template" : "{{e}}",
            "isfooter" : false,
            "isheader" : false,
            "multiple" : false,
            "optional" : false,
            "label" : "Schedule B: Table of Conditions",
            "name" : "conds"
        },
        {
            "meta" : [
                {
                    "default" : "",
                    "label" : "Application",
                    "type" : "Artifact",
                    "name" : "f"
                }
            ],
            "footer" : "",
            "header" : "",
            "template" : "{{f}}",
            "isfooter" : false,
            "isheader" : false,
            "multiple" : false,
            "optional" : false,
            "label" : "Application",
            "name" : "app"
        }
    ],
    "versionNumber" : 1,
    "documentType" : "Decision Package",
    "code" : "decision-package"
}];

var artifacttypes = [{
    name: 'Memo to the Minister from the Associate Deputy Minister',
    multiple: false,
    isTemplate: false,
    isDocument:true,
    code: 'memo-adm',
    milestone: 'memo-adm',
    versions : [
        'Final'
    ],
    stages: [{
        name: 'Edit',
        next: '',
        prev: '',
        activity: 'edit'
    }]
},{
    name: 'Recommendations of the Executive Director',
    multiple: false,
    isTemplate: false,
    isDocument: true,
    code: 'memo-epd',
    milestone: 'memo-epd',
    versions : [
        'Final'
    ],
    stages: [{
        name: 'Edit',
        next: '',
        prev: '',
        activity: 'edit'
    }]
},{
    name: 'Environmental Certificate',
    multiple: false,
    isTemplate: false,
    isDocument: true,
    code: 'certificate',
    milestone: 'certificate',
    versions : [
        'Final'
    ],
    stages: [{
        name: 'Edit',
        next: '',
        prev: '',
        activity: 'edit'
    }]
},{
    name: 'Application',
    multiple: false,
    isTemplate: false,
    isDocument: true,
    code: 'application',
    milestone: 'application',
    versions : [
        'Final'
    ],
    stages: [{
        name: 'Edit',
        next: '',
        prev: '',
        activity: 'edit'
    }]
},{
    name: 'Referral Package',
    multiple: false,
    isTemplate: true,
    isDocument: false,
    code: 'referral-package',
    milestone: 'referral-package',
    versions : [
        'Final'
    ],
    stages: [{
        name: 'Edit',
        next: 'Decision',
        prev: '',
        activity: 'edit'
    },{
        name: 'Decision',
        next: 'Publishing',
        prev: 'Edit',
        activity: 'decision'
    },{
        name: 'Publishing',
        next: '',
        prev: 'Decision',
        activity: 'publish'
    }]
},{
    name: 'Decision Package',
    multiple: false,
    isTemplate: true,
    isDocument: false,
    code: 'decision-package',
    milestone: 'decision-package',
    versions : [
        'Final'
    ],
    stages: [{
        name: 'Edit',
        next: 'Decision',
        prev: '',
        activity: 'edit'
    },{
        name: 'Decision',
        next: 'Publishing',
        prev: 'Edit',
        activity: 'decision'
    },{
        name: 'Publishing',
        next: '',
        prev: 'Decision',
        activity: 'publish'
    }]
}];


module.exports = {
	templates:templates,
    activities:activities,
	milestones:milestones,
	artifacttypes:artifacttypes
};