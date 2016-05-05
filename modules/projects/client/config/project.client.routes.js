'use strict';

angular.module('project').config (
	['$locationProvider', '$stateProvider', '$urlRouterProvider', '_',
	function ($locationProvider, $stateProvider, $urlRouterProvider, _) {

	$stateProvider
	.state('p', {
		url: '/p/:projectid',
		abstract: true,
		templateUrl: 'modules/projects/client/views/project.abstract.html',
		resolve: {
			project: function ($stateParams, ProjectModel) {
				// console.log ('loading project');
				if ($stateParams.projectid === 'new') {
					return ProjectModel.getNew ();
				} else {
					return ProjectModel.byCode ($stateParams.projectid);
				}
			},
			eaoAdmin: function (project) {
				return project.adminRole;
			},
			proponentAdmin: function (project) {
				return project.proponentAdminRole;
			}
		},
		controller: function ($scope, $stateParams, project, ENV, $rootScope, ProjectModel) {
			$scope.project = project;
			$scope.environment = ENV;
			$scope.isNew = ($stateParams.projectid === 'new');

			ProjectModel.setModel(project);

			$scope.intakeQuestions = ProjectModel.getProjectIntakeQuestions();

			var unbind = $rootScope.$on('refreshProject', function() {
				// console.log('refreshProject', $stateParams.projectid);
				$scope.project = angular.copy( ProjectModel.byCode ($stateParams.projectid) );
			});
			$scope.$on('$destroy',unbind);

		}
	})
	// -------------------------------------------------------------------------
	//
	// the detail view of a project
	//
	// -------------------------------------------------------------------------
	.state('p.detail', {
		url: '/detail',
		templateUrl: 'modules/projects/client/views/project-partials/project.detail.html',
		controller: function ($scope, $state, project, ProjectModel, $window) {
			$scope.project = project;

			// complete the current phase.
			$scope.completePhase = function() {
				ProjectModel.completePhase( project ).then( function(res) {
					$scope.project = res;
					$scope.$apply ();
					$state.go($state.current, {}, {reload: true});
					// $window.location.reload();
					// $state.transitionTo('p.detail', {projectid:project.code}, {
			  // 			reload: true, inherit: false, notify: true
					// });
				});
			};

			// complete the current phase.
			$scope.startNextPhase = function() {
				ProjectModel.nextPhase( project ).then( function(res) {
					$scope.project = res;
					$scope.$apply ();
					$state.go($state.current, {}, {reload: true});
					// $window.location.reload();
					// $state.transitionTo('p.detail', {projectid:project.code}, {
			  // 			reload: true, inherit: false, notify: true
					// });
				});
			};

			// complete the current phase.
			$scope.publishProject = function() {
				ProjectModel.publishProject( project ).then( function(res) {
					$scope.project = res;
					$state.go($state.current, {}, {reload: true});
					// $state.transitionTo('p.detail', {projectid:project.code}, {
			  // 			reload: true, inherit: false, notify: true
					// });
				});
			};
		}
	})
	// -------------------------------------------------------------------------
	//
	// the detail view of a project
	//
	// -------------------------------------------------------------------------
	.state('p.edit', {
		url: '/edit',
		templateUrl: 'modules/projects/client/views/project-partials/project.entry.html',
		controller: 'controllerProjectEntry',
		// resolve: {
		// 	intakeQuestions: function(ProjectModel) {
		// 		return ProjectModel.getProjectIntakeQuestions();
		// 	}
		// },
		onEnter: function (MenuControl, project, $stateParams) {
			if ($stateParams.projectid === 'new') {
				MenuControl.routeAccess ('', '','proponent');
			}
			else {
				MenuControl.routeAccess (project.code, 'pro','edit-project');
			}
		}
	})
	// -------------------------------------------------------------------------
	//
	// the decision package mockup
	//
	// -------------------------------------------------------------------------
	.state('p.decision', {
		url: '/decision',
		templateUrl: 'modules/projects/client/views/project-partials/project.decision.html',
		controller: function ($scope, $state, project, ProjectModel) {

		}
	})
	.state('p.schedule', {
		url: '/schedule',
		templateUrl: 'modules/projects/client/views/project-partials/project.schedule.html',
		controller: function ($scope, $state, project, ProjectModel, MilestoneModel, PhaseModel, $rootScope, ArtifactModel) {
			var self = this;
			self.rPhases = undefined;
			self.rSelPhase = undefined;
			self.rMilestonesForPhase = undefined;

			self.refresh = function () {
				// console.log("Refreshing");
				PhaseModel.phasesForProject(project._id).then(function (res) {
					// console.log("New set of phase data:",res);
					$scope.rPhases = res;
					$scope.$apply();
				});
			};
			$scope.$watch('project', function(newValue) {
				// console.log("watching project:",newValue);
				self.project = newValue;
				self.refresh();
			});

			$scope.popluatePhaseDropdown = function (phase) {
				// console.log("populate phase on phase:",phase.code);
				$scope.rSelPhase = phase;
				$scope.rMilestonesForPhase = [];
				switch(phase.code) {
					case "pre-ea":
						$scope.rMilestonesForPhase = [{"name": "Project Description Accepted",
													   "code": "project-description-accepted"},
													  {"name": "Substitution Decision",
													   "code": "substitution-decision"},
													  {"name": "Section 10(1)c Order",
													   "code": "section-10-1-c-order"},
													  ];
						break;
					case "pre-app":
						$scope.rMilestonesForPhase = [{"name": "Section 11 Order",
													   "code": "section-11-order"},
													  {"name": "Assessment Fee - Installment 1",
													   "code": "assessment-fee-installment-1"},
													  {"name": "Draft AIR Accepted",
													   "code": "draft-air-accepted"},
													  {"name": "Pre-App PCP Initiated",
													   "code": "pre-app-pcp-initiated"},
													  {"name": "AIR Finalized and Approved",
													   "code": "air-finalized-and-approved"},
													  ];
						break;
					case "evaluation":
						$scope.rMilestonesForPhase = [{"name": "Draft Application Submitted",
													   "code": "draft-application-submitted"},
													  {"name": "Assessment Fee - Installment 2",
													   "code": "assessment-fee-installment-2"}
													  ];
						break;
					case "application-review":
						$scope.rMilestonesForPhase = [{"name": "Application Accepted",
													   "code": "application-accepted"},
													  {"name": "Review PCP Initiated",
													   "code": "review-pcp-initiated"},
													  ];
						break;
					case "decision":
						$scope.rMilestonesForPhase = [{"name": "Minister's Decision Package Delivered",
													   "code": "ministers-decision-package-delivered"}];
						break;
					case "post-certification":
						$scope.rMilestonesForPhase = [{"name": "Certificate Issued - s.17",
													   "code": "certificate-issued-s.17"},
													  {"name": "Substantially Started Decision",
													   "code": "substantially-started-decision"}
													   ];
						break;
				}
				$scope.rMilestonesForPhase.push({"name": "Project Withdrawn",
												 "code": "project-withdrawn"});
			};

			// Handle the add milestone
			$scope.addMilestone = function(selectedMilestone) {
				// Just add a milestone, attach it to a specific phase - this is a generic
				// schedule, which really doesn't follow the flow of anything.  It's just a
				// Marker of sorts.  We will need to look this up when phases/milestones progress
				// through the flow of the business in order to delete/reset these milestones.
				// For now, this becomes a 'look ahead' schedule that staff can use to view
				// the project 'plan'
				MilestoneModel.add({
					"code": selectedMilestone.code,
					"name": selectedMilestone.name,
					"phase": $scope.rSelPhase
				})
				.then(function (ms) {
					$scope.rSelPhase.milestone = ms;
					$scope.rSelPhase.milestones.push(ms);
					PhaseModel.save($scope.rSelPhase);
				});
			};
			$scope.saveMilestone = function (data) {
				data.dateStartedEst = $scope.dateStartedEst;
				data.dateCompletedEst = $scope.dateCompletedEst;
				MilestoneModel.save(data);
			};
			// Handle the delete milestone
			$scope.selectedMilestone = function (milestone, phase) {
				// console.log("selected milestone: ", MilestoneModel);
				// console.log("selected phase:", $scope.rSelPhase);
				self.selMilestone = milestone;
				MilestoneModel.get(milestone).then(function (res) {
					console.log("Milestone with activities data:",res);
					$scope.data = res;
					$scope.$apply();
				});
			};
			$scope.editMilestone = function (milestone, phase) {
				self.selMilestone = milestone;
				// Hack until we put into the service
				MilestoneModel.get('/api/milestone/'+milestone).then(function (res) {
					console.log("Milestone with activities data:",res);
					$scope.data = res;
					$scope.$apply();
				});
			};
			$scope.confirmRemoveMilestone = function () {
				// console.log("Removing Milestone:",self.selMilestone);
				MilestoneModel.deleteMilestone(self.selMilestone).then(
					function(res) {
						$rootScope.$broadcast('refreshPhases', res);
					}
				);
			};
			var unbind = $rootScope.$on('refreshPhases', function() {
				self.refresh();
			});
			$scope.$on('$destroy', unbind);
		}
	})
	;
}]);










