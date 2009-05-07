#!/usr/bin/python

resources = ['clay','wood','iron','wheat']

class R:
    def __init__(self, clay=0, wood=0, iron=0, wheat=0):
        self.clay = clay
        self.wood = wood
        self.iron = iron
        self.wheat = wheat

    def add(self, res):
        for r in resources:
            setattr(self, r, getattr(self, r, 0) + getattr(res, r, 0))

class Production(R):
    def wait_hours(self, res, target):
        hrs = 0
        for r in resources:
            res_r = getattr(res,r,0)
            target_r = getattr(target,r,0)
            if res_r < target_r:
                hrs = max(hrs, (target_r - res_r) * 1.0 / getattr(self,r,1))
        return hrs

    def produce(self, hours):
        out = R()
        for r in resources:
            setattr(out, r, int(getattr(self,r,0) * hrs))
        return out

class Capacity(R):
    def contains(self, res):
        out = true
        for r in resources:
            out = out and getattr(self, r, 0) >= getattr(res, r, 0)
        return out

class Field:
    def __init__(self):
        self.level = 0
        self.prodmap = [2,5,9,15,22,33,50,70,100,145,200]
    def upgrade(self):
        self.level += 1
    def production(self):
        return self.prodmap[self.level]

class BuildLevel:
    def __init__(self, cost, delta_prod, delta_capacity):
        self.cost = cost
        self.delta_prod = delta_prod
        self.delta_capacity = delta_capacity

granary_levels = [
    BuildLevel(R(0,0,0,0), R(), R(0,0,0,800)),
    BuildLevel(R(80,100,70,20), R(), R(wheat=400)),
    BuildLevel(R(100,130,90,25), R(), R(wheat=500)),
    BuildLevel(R(130,165,115,35), R(), R(wheat=600)),
    BuildLevel(R(170,210,145,40), R(), R(wheat=800)),
    BuildLevel(R(215,270,190,55), R(), R(wheat=900)),
    BuildLevel(R(275,345,240,70), R(), R(wheat=1000)),
    BuildLevel(R(350,440,310,90), R(), R(wheat=1300)),
    BuildLevel(R(450,565,395,115), R(), R(wheat=1500)),
    BuildLevel(R(575,720,505,145), R(), R(wheat=1800)),
    BuildLevel(R(740,920,645,185), R(), R(wheat=2200)),
    BuildLevel(R(945,1180,825,235), R(), R(wheat=2600)),
    BuildLevel(R(1210,1510,1060,300), R(), R(wheat=3200)),
    BuildLevel(R(1545,1935,1355,385), R(), R(wheat=3800)),
    BuildLevel(R(1980,2475,1735,495), R(), R(wheat=25900-21400)),
    BuildLevel(R(2535,3170,2220,635), R(), R(wheat=31300-25900)),
    BuildLevel(R(3245,4055,2840,810), R(), R(wheat=37900-31300)),
    BuildLevel(R(4155,5190,3635,1040), R(), R(wheat=45700-37900)),
    BuildLevel(R(5315,6645,4650,1330), R(), R(wheat=54800-45700)),
    BuildLevel(R(6805,8505,5955,1700), R(), R(wheat=66400-54800)),
    BuildLevel(R(8710,10890,7620,2180), R(), R(wheat=80000-66400))
    ]

