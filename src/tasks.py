import requests
import threading
import json


class TaskHandler:
    def __init__(self):
        self.hRIT_delayed = {}
        self.hRIT_current = {}
        self.updateCache()
        TaskHandler.set_interval(self.updateCache, 60*5)

# Start HotspotsRIT webworker
    # Source for corrections: I made it up
    corrections = {
        "Library_3rd_Floor": {"max_occ": 550},
        "Library_2nd_Floor": {"max_occ": 250},
        "Library_1st_Floor": {"max_occ": 350},
        "Library_4th_Floor": {"max_occ": 400},
        "Library_A_Level": {"max_occ": 300},
        "Ross_Hall": {"max_occ": 200},
        "Gordon_Field_House": {"max_occ": 750}
    }

    def getCache(self):
        return self.hRIT_delayed
    
    def getCurrent(self):
        return self.hRIT_current

    def updateCache(self):
        r = requests.get("https://maps.rit.edu/proxySearch/densityMapDetail.php?mdo=1")
        if r.status_code == 200:
            if self.hRIT_current == {}:
                self.hRIT_delayed = TaskHandler.dataAdjustments(r.json())
            else:
                self.hRIT_delayed = json.loads(json.dumps(self.hRIT_current)) # deepcopy was returning a function for some reason
            self.hRIT_current = TaskHandler.dataAdjustments(r.json())
            return self.hRIT_delayed, self.hRIT_current
        else:
            print("FUCK!", r.status_code)

    def dataAdjustments(data):
        for dp in data:
            if dp['location'] in TaskHandler.corrections:
                for correction in TaskHandler.corrections[dp['location']]:
                    dp[correction] = TaskHandler.corrections[dp['location']][correction]
        return data
        
    def set_interval(func, sec):
        def func_wrapper():
            TaskHandler.set_interval(func, sec)
            func()
        t = threading.Timer(sec, func_wrapper)
        t.start()
        return t

